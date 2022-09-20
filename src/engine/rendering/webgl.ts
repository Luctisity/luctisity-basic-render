import vertexShaderSource   from '../../assets/shaders/vertex.vsh?raw';
import fragmentShaderSource from '../../assets/shaders/fragment.fsh?raw';
import Drawable from './drawable';

const drawables: Set <Drawable> = new Set();

let gl:                     WebGL2RenderingContext,
    program:                WebGLProgram, 
    positionAttribLocation: number, 
    colorAttribLocation:    number, 
    vertexArrayObject:      WebGLVertexArrayObject | null;

export function initGl (canvas: HTMLCanvasElement) {
    // get gl context

    gl = canvas.getContext('webgl2')!;
    if (!gl) return false;


    // black clear color

    clearBg();


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

    program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram (program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return false;
    }
    
    gl.useProgram(program);

    // create drawables

    [
        positionAttribLocation, 
        colorAttribLocation, 
        vertexArrayObject
    ] = Drawable.init(gl, program);

    renderGl();

    return true;

}

export function renderGl () {

    clearBg();
    
    drawables.forEach(d => {
        d.render(program, positionAttribLocation, colorAttribLocation);
    });

    gl.bindVertexArray(vertexArrayObject);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}

export function addDrawable (d: Drawable) {
    drawables.add(d);
}

function clearBg () {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}