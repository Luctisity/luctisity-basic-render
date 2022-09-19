import { mat3 } from "gl-matrix";
import { ajustToCanvasSize } from "../util/util";

export const rectVertices = [
//  X     Y       R  G  B
    -0.5, 0.5,    1, 0, 0,
    0.5,  -0.5,   0, 1, 0,
    -0.5, -0.5,   0, 0, 1,
    -0.5, 0.5,    1, 0, 0,
    0.5,  0.5,    1, 1, 0,
    0.5,  -0.5,   0, 1, 0,
];

export type DrawableInitReturnType = [number, number, WebGLVertexArrayObject | null];

export default class Drawable {

    width:  number;
    height: number;

    canvas: HTMLCanvasElement;
    gl:     WebGL2RenderingContext;

    transX: number = 0;
    transY: number = 0;
    rot:    number = 0;
    scaleX: number = 1;
    scaleY: number = 1;

    constructor (width: number, height: number, canvas: HTMLCanvasElement) {
        this.width  = width;
        this.height = height;
        this.canvas = canvas;
        this.gl     = this.canvas.getContext("webgl2")!;
    }

    static init (gl: WebGL2RenderingContext, program: WebGLProgram) {
        // create vbo an vao

        const vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectVertices), gl.STATIC_DRAW);

        const vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(vertexArrayObject);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);

        const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
        const colorAttribLocation    = gl.getAttribLocation(program, 'vertColor');

        gl.vertexAttribPointer(
            positionAttribLocation, 2,
            gl.FLOAT,  false,
            5 * Float32Array.BYTES_PER_ELEMENT,  0
        );
        gl.vertexAttribPointer(
            colorAttribLocation, 3,
            gl.FLOAT, false,
            5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT
        );

        let r: DrawableInitReturnType = [
            positionAttribLocation, 
            colorAttribLocation, 
            vertexArrayObject
        ];
        return r;
    }

    render (program: WebGLProgram, posLoc: number, colorLoc: number) {

        const gl = this.gl;
        
        let [widthAdj, heightAdj] = ajustToCanvasSize(
            this.width, this.height, 
            this.canvas.width, this.canvas.height
        );

        let transform = mat3.create();

        mat3.translate (transform, transform, [this.transX, this.transY]);
        mat3.scale     (transform, transform, [widthAdj, heightAdj])
        mat3.scale     (transform, transform, [this.scaleX, this.scaleY]);
        mat3.rotate    (transform, transform, this.rot);

        gl.uniformMatrix3fv(gl.getUniformLocation(program, 'transform'), false, transform);

        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(colorLoc);

    }

}