import vertexShaderSource   from '../../assets/shaders/vertex.vsh?raw';
import fragmentShaderSource from '../../assets/shaders/fragment.fsh?raw';
import Drawable from './drawable';

export default class RenderManager {

    drawables: Set <Drawable> = new Set();

    gl!:                     WebGL2RenderingContext;
    program!:                WebGLProgram; 
    positionAttribLocation!: number; 
    colorAttribLocation!:    number; 
    vertexArrayObject!:      WebGLVertexArrayObject | null;

    initGl (canvas: HTMLCanvasElement) {
        // get gl context

        this.gl = canvas.getContext('webgl2', { alpha: false })!;
        if (!this.gl) return false;
        let gl = this.gl;


        // black clear color

        this.clearBg();


        // create vertex and fragment shaders

        const vertexShader   = gl.createShader(gl.VERTEX_SHADER)!;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;

        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.shaderSource(fragmentShader, fragmentShaderSource);

        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('VERTEXSHADER: ' + gl.getShaderInfoLog(vertexShader));
            return false;
        }

        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('FRAGMENTSHADER: ' + gl.getShaderInfoLog(fragmentShader));
            return false;
        }


        // create program

        this.program = gl.createProgram()!;
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);

        gl.linkProgram (this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.program));
            return false;
        }
        
        gl.useProgram(this.program);

        // create drawables

        [
            this.positionAttribLocation, 
            this.colorAttribLocation, 
            this.vertexArrayObject
        ] = Drawable.init(gl, this.program);

        this.render();

        return true;
    }

    render () {
    
        this.clearBg();
        
        this.drawables.forEach(d => {
            d.render(this.program, this.positionAttribLocation, this.colorAttribLocation, this.vertexArrayObject);
        });
    
    }
    
    addDrawable (d: Drawable) {
        this.drawables.add(d);
    }
    
    private clearBg () {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

}