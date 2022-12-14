import assetAtlas from '../assets/assetAtlas';
import * as Tone from 'tone';
import { markiplierToSemitone } from '../util/util';

export type AudioTrack = {
    track:    Tone.Player
    channel?: AudioChannel
}

export type AudioTracksMap = {
    [key: string]: AudioTrack
}

export type AudioChannel = {
    effectOptions: SoundEffectOptions
    volume: Tone.Gain,
    pan:    Tone.Panner,
    pitch:  Tone.PitchShift,
    reverb: Tone.Reverb,
    tracks: AudioTrack[]
}

export type AudioChannelsMap = {
    [key: string]: AudioChannel
}

export type QueueOptions = {
    loop: boolean
}
export type SoundEffectOptions = {
    pitch?:  number,
    speed?:  number,
    pan?:    number,
    reverb?: number
}
export type SoundEffectOption = "pitch" | "speed" | "pan" | "reverb";
const defaultSoundEffectOptions = {
    pitch:  1,
    speed:  1,
    pan:    0,
    reverb: 0
}


export default class AudioManager {

    audioContext = new AudioContext();
    audioTracks:   AudioTracksMap   = {};
    audioChannels: AudioChannelsMap = {};

    initAudio () {
        // if browser does not support web audio
        if (!this.audioContext) return false;
    
        // load every sound in the asset atlas and connect it to a track
        for (let key in assetAtlas.sounds) {
            const elem: HTMLAudioElement = new Audio();
            elem.src = assetAtlas.sounds[key];
            elem.load();
            const track = new Tone.Player(elem.src);
          
            // add an entry to the audio tracks map
            this.audioTracks[key] = { track };
        }
    
        return true;
    }

    createChannel (id: string) {
        const volume = new Tone.Gain();
        const pan    = new Tone.Panner();
        const pitch  = new Tone.PitchShift();
        const reverb = new Tone.Reverb();
        pitch.windowSize = 0.05;
        reverb.wet.value = 0;
    
        volume.connect(pan);
        pan.connect(pitch);
        pitch.connect(reverb);
        reverb.toDestination();
    
        this.audioChannels[id] = {
            volume, pan, pitch, reverb,
            tracks: [], effectOptions: defaultSoundEffectOptions
        }
    }

    connectSoundToChannel (sound: string, channel: string) {
        // get the target audio track
        if (!this.audioTracks[sound] || !this.audioChannels[channel]) return;
        const track = this.audioTracks[sound];
    
        // if this track is already connected to a channel, remove it from the channel's list of tracks
        if (track.channel) track.channel.tracks = track.channel.tracks.filter(f => f != track);
    
        // reconnect the track to the new channel and add it to it's track list
        track.track.disconnect();
        track.channel = this.audioChannels[channel];
        track.track.connect(track.channel.volume);
        track.channel?.tracks.push(track);
    
        // adjust the track elem's playback rate
        track.track.playbackRate = geteff(track.channel.effectOptions, 'speed');
    }

    setChannelVolume (id: string, volume: number = 1) {
        const channel = this.audioChannels[id];
        if (!channel) return;
    
        channel.volume.gain.value = volume;
    }
    
    setChannelEffects (id: string, effects: SoundEffectOptions = defaultSoundEffectOptions) {
        const channel = this.audioChannels[id];
        if (!channel) return;
        Object.assign(channel.effectOptions, effects);
    
        // pan
        channel.pan.pan.value = geteff(effects, 'pan');

        // pitch (cannot go lower than 0.1)
        if (effects.pitch !== undefined) {
            channel.pitch.pitch = markiplierToSemitone(Math.max(geteff(effects, 'pitch'), 0.1));
        }

        // speed (cannot go lower than 0.1)
        if (effects.speed !== undefined) {
            const playbackRate = Math.max(geteff(effects, 'speed'), 0.1);
            channel.tracks.forEach(track => {
                track.track.playbackRate = playbackRate;
            });
        }

        // reverb (wet can be between 0 an 1, and decay between 0.1 and 10)
        if (effects.reverb !== undefined) {
            channel.reverb.wet.value = Math.min(Math.max(
                geteff(effects, 'reverb')*0.8, 
            0), 1);
            channel.reverb.decay = Math.min(Math.max(
                geteff(effects, 'reverb'), 
            0.1), 10);
        }
    }


    playSound (id: string) {
        this.queueSound(id, { loop: false });
    }
    
    playSoundLoop (id: string) {
        this.queueSound(id, { loop: true });
    }
    
    stopSound (id: string) {
        this.audioTracks[id]?.track.stop();
    }

    stopAllSounds () {
        for (let track in this.audioTracks) {
            this.audioTracks[track].track.stop();
        }
    }
    
    
    private queueSound (id: string, opts: QueueOptions) {
        // if no interaction yet, resume the audio context
        if (Tone.context.state == 'suspended') Tone.start();
    
        const targetAudioTrack = this.audioTracks[id];
        if (!targetAudioTrack) return;
    
        targetAudioTrack.track.loop = opts.loop;
        targetAudioTrack.track.start(0);
    }

}

function geteff (effects: SoundEffectOptions, key: SoundEffectOption) {
    return effects[key] || defaultSoundEffectOptions[key];
}