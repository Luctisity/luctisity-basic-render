import assetAtlas from '../assets/assetAtlas';
import * as Tone from 'tone';

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
const audioContext = new AudioContext();
const audioTracks:   AudioTracksMap   = {};
const audioChannels: AudioChannelsMap = {};


export function initAudio () {
    // if browser does not support web audio
    if (!audioContext) return false;

    // load every sound in the asset atlas and connect it to a track
    for (let key in assetAtlas.sounds) {
        const elem: HTMLAudioElement = new Audio();
        elem.src = assetAtlas.sounds[key];
        elem.load();
        const track = new Tone.Player(elem.src);
      
        // add an entry to the audio tracks map
        audioTracks[key] = { track };
    }

    return true;
}

export function createChannel (id: string) {
    const volume = new Tone.Gain();
    const pan    = new Tone.Panner();
    const pitch  = new Tone.PitchShift();
    pitch.windowSize = 0.05;

    Tone.connect(volume, pan);
    Tone.connect(pan, pitch);
    pitch.toDestination();

    audioChannels[id] = {
        volume, pan, pitch,
        tracks: [], effectOptions: defaultSoundEffectOptions
    }
}

export function connectSoundToChannel (sound: string, channel: string) {
    // get the target audio track
    if (!audioTracks[sound] || !audioChannels[channel]) return;
    const track = audioTracks[sound];

    // if this track is already connected to a channel, remove it from the channel's list of tracks
    if (track.channel) track.channel.tracks = track.channel.tracks.filter(f => f != track);

    // reconnect the track to the new channel and add it to it's track list
    track.track.disconnect();
    track.channel = audioChannels[channel];
    track.track.connect(track.channel.volume);
    track.channel?.tracks.push(track);

    // adjust the track elem's playback rate
    track.track.playbackRate = geteff(track.channel.effectOptions, 'speed');
}

export function setChannelVolume (id: string, volume: number = 1) {
    const channel = audioChannels[id];
    if (!channel) return;

    channel.volume.gain.value = volume;
}

export function setChannelEffects (id: string, effects: SoundEffectOptions = defaultSoundEffectOptions) {
    const channel = audioChannels[id];
    if (!channel) return;
    Object.assign(channel.effectOptions, effects);

    channel.pan.pan.value = geteff(effects, 'pan');
    if (effects.pitch) {
        channel.pitch.pitch = markiplierToSemitone(Math.max(geteff(effects, 'pitch'), 0.1));
    }
    if (effects.speed) {
        const playbackRate = Math.max(geteff(effects, 'speed'), 0.1);
        channel.tracks.forEach(track => {
            track.track.playbackRate = playbackRate;
        });
    }
}


export function playSound (id: string) {
    queueSound(id, { loop: false });
}

export function playSoundLoop (id: string) {
    queueSound(id, { loop: true });
}

export function stopSound (id: string) {
    audioTracks[id]?.track.stop();
}


function queueSound (id: string, opts: QueueOptions) {
    // if no interaction yet, resume the audio context
    if (Tone.context.state == 'suspended') Tone.start();

    const targetAudioTrack = audioTracks[id];
    if (!targetAudioTrack) return;

    targetAudioTrack.track.loop = opts.loop;
    targetAudioTrack.track.start(0);
}

function geteff (effects: SoundEffectOptions, key: SoundEffectOption) {
    return effects[key] || defaultSoundEffectOptions[key];
}

function markiplierToSemitone (factor: number) { 
    return Math.log(factor) * Math.LOG2E * 12;
}