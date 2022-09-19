import vertexShaderSource   from '../../assets/shaders/vertex.vsh?raw';
import fragmentShaderSource from '../../assets/shaders/fragment.fsh?raw';
import Drawable from './drawable';

export function initGl (canvas: HTMLCanvasElement) {
    // get gl context

    const gl = canvas.getContext('webgl2');
    if (!gl) return false;


    // black clear color

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


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

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram (program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return false;
    }
    
    gl.useProgram(program);

    // create drawable

    const [
        positionAttribLocation, 
        colorAttribLocation, 
        vertexArrayObject
    ] = Drawable.init(gl, program);

    const testRect = new Drawable(400, 200, canvas);
    testRect.rot = 15;
    testRect.render(program, positionAttribLocation, colorAttribLocation);

    // render

    gl.bindVertexArray(vertexArrayObject);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return true;

}