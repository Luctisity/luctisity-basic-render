import { Component, createRef } from 'preact';
import Drawable from '../../engine/rendering/drawable';
import { addDrawable, initGl, renderGl } from '../../engine/rendering/webgl';
import './RenderCanvas.css';

export type RenderCanvasProps = {
    width: number, height: number, fps?: number
}

export default class RenderCanvas extends Component <RenderCanvasProps> {

    state = {
        error: false
    }

    canvasRef = createRef();

    testDrawable?: Drawable;

    render () {
        return <div className="canvas-wrapper">
            <canvas ref={this.canvasRef} width={this.props.width} height={this.props.height} className={this.getCanvasClassName()}></canvas>
            {this.getErrorScreen()}
        </div>
    }

    componentDidMount() {
        let canvas = this.canvasRef.current;

        // create a drawable
        this.testDrawable = new Drawable(300, 200, canvas);
        addDrawable(this.testDrawable);

        // initiate webgl, return if error
        let success = initGl(this.canvasRef.current);
        if (!success) return this.setState({ error: true });

        // start render loop
        requestAnimationFrame(this.step);
    }

    step = () => {
        // test drawable action
        this.testDrawable!.rot += 1;

        // render and continue loop
        renderGl();
        requestAnimationFrame(this.step);
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