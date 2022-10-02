import { Component, createRef } from 'preact';
import Drawable from '../../engine/rendering/drawable';
import RenderManager from '../../engine/rendering/renderManager';
import AudioManager from '../../engine/audio/audioManager';
import './RenderCanvas.css';

export type RenderCanvasProps = {
    width: number, height: number, fps?: number
}

export default class RenderCanvas extends Component <RenderCanvasProps> {

    state = {
        error: false
    }

    canvasRef = createRef();

    testDrawable?:  Drawable;
    testDrawable2?: Drawable;

    fpsDelta = this.props.fps ? 1/this.props.fps : -1;

    renderManager = new RenderManager();
    audioManager  = new AudioManager();

    render () {
        return <div className="canvas-wrapper">
            <canvas id="luctisityRenderCanvas" ref={this.canvasRef} width={this.props.width} height={this.props.height} className={this.getCanvasClassName()}></canvas>
            {this.getErrorScreen()}
        </div>
    }

    componentDidMount() {
        let canvas = this.canvasRef.current;

        // create a drawable
        this.testDrawable = new Drawable("man", canvas);
        this.testDrawable.colorR = 0;
        this.testDrawable.colorG = 128;

        this.testDrawable2 = new Drawable("troll", canvas);
        this.testDrawable2.scaleX = 50;
        this.testDrawable2.scaleY = 80;

        this.renderManager.addDrawable(this.testDrawable2);
        this.renderManager.addDrawable(this.testDrawable);

        // initiate webgl and audio, return if error
        let success = this.renderManager.initGl(this.canvasRef.current) && this.audioManager.initAudio();
        if (!success) return this.setState({ error: true });

        // start render loop
        requestAnimationFrame(() => this.step(Date.now()));

        // sound test
        this.audioManager.createChannel("man");
        this.audioManager.createChannel("troll");
        this.audioManager.connectSoundToChannel("fart", "man");
        this.audioManager.connectSoundToChannel("quandale", "troll");
        this.audioManager.setChannelEffects("troll", { pitch: 0.5, speed: 1, reverb: 10 });

        setTimeout(() => {
            this.audioManager.playSound("quandale");
        }, 2000);
        setTimeout(() => {
            this.audioManager.playSound("quandale");
            this.audioManager.setChannelEffects("troll", { reverb: 1 });
        }, 4000);
        setTimeout(() => {
            this.audioManager.setChannelEffects("man", { reverb: 1 });
            this.audioManager.playSoundLoop("fart");
        }, 6000);
        setTimeout(() => {
            this.audioManager.stopSound("quandale");
        }, 7000);
        setTimeout(() => {
            this.audioManager.setChannelEffects("man", { reverb: 0 });
            this.audioManager.playSound("fart");
        }, 11000);
    }

    step = (prevNow: number = Date.now(), internalPrevNow: number = 0) => {
        let now = Date.now();
        let delta = (now - prevNow) * 0.001;

        // if the frame rate is fixed
        if (this.fpsDelta != -1) {
            let internalDelta = (now - internalPrevNow) * 0.001;
            
            // wait until the fps threshold is reached
            if (delta < this.fpsDelta - internalDelta) {
                requestAnimationFrame(() => this.step(prevNow, now));
                return;
            }
        }

        // test drawable action
        this.testDrawable!.rot += 36 * delta;
        this.testDrawable!.opacity = Math.sin(now*0.001) * 50 + 50;

        this.testDrawable2!.posX = Math.sin(now*0.001) * 100 + 420;
        this.audioManager.setChannelEffects("troll", { 
            pan: Math.sin(now*0.001)
            /*pitch: Math.sin(now*0.001)+1,
            speed: 1/(Math.sin(now*0.001)+1.5),*/
        });
        this.testDrawable2!.setTexture(Math.round(Math.random()) ? "man" : "troll");

        // render and continue loop
        this.renderManager.render();
        requestAnimationFrame(() => this.step(now, now));
    }

    getCanvasClassName () {
        return this.state.error ? "hid" : "";
    }

    getErrorScreen () {
        return this.state.error
            ? <div className="luctisity-render-popup error">
                <p>Your browser does not support Luctisity</p>
            </div>
            : null;
    }

}