import vertexShaderSource   from '../../assets/shaders/vertex.vsh?raw';
import fragmentShaderSource from '../../assets/shaders/fragment.fsh?raw';

export function initGl (canvas: HTMLCanvasElement) {
    // get gl context

    const gl = canvas.getContext('webgl');
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


    // create buffers

    const triVertecies = [
     // X Y           R G B
        0.0,  0.5,    1, 0, 0,
        -0.5, -0.5,   0, 1, 0,
        0.5,  -0.5,   0, 0, 1,
    ];

    const triVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triVertecies), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttribLocation    = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation,
        2, // count
        gl.FLOAT,
        false, 
        5 * Float32Array.BYTES_PER_ELEMENT, // size of one vertex
        0 // offset
    );
    gl.vertexAttribPointer(
        colorAttribLocation,
        3, // count
        gl.FLOAT,
        false, 
        5 * Float32Array.BYTES_PER_ELEMENT, // size of one vertex
        2 * Float32Array.BYTES_PER_ELEMENT // offset
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);


    // render

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    return true;
}