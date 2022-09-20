import { mat3 } from "gl-matrix";
import { canvasSizeCompensate, transformColor, transformPosCoords, transformRotCoords, transformScaleCoords } from "../util/util";

import testTexture from "../../assets/textures/troll.png";

let CANVASW:  number;
let CANVASH:  number;
let CANVASWC: number;
let CANVASHC: number;

export const rectVertices = [
//  X     Y       U  V
    -0.5,  0.5,   0, 0,
     0.5, -0.5,   1, 1,
    -0.5, -0.5,   0, 1,
    -0.5,  0.5,   0, 0,
     0.5,  0.5,   1, 0,
     0.5, -0.5,   1, 1,
];

export type DrawableInitReturnType = [number, number, WebGLVertexArrayObject | null, WebGLTexture | null];

export default class Drawable {

    width:  number;
    height: number;

    canvas: HTMLCanvasElement;
    gl:     WebGL2RenderingContext;

    posX:   number = 320;
    posY:   number = 180;
    rot:    number = 0;
    scaleX: number = 100;
    scaleY: number = 100;

    colorR:  number = 255;
    colorG:  number = 255;
    colorB:  number = 255;
    opacity: number = 100;

    constructor (width: number, height: number, canvas: HTMLCanvasElement) {
        this.width  = width;
        this.height = height;
        this.canvas = canvas;
        this.gl     = this.canvas.getContext("webgl2")!;

        // canvas vars

        [CANVASW, CANVASH] = [canvas.width*0.5, canvas.height*0.5];
        [CANVASWC, CANVASHC] = canvasSizeCompensate(CANVASW, CANVASH);
    }

    static init (gl: WebGL2RenderingContext, program: WebGLProgram) {

        gl.enable(gl.BLEND);

        // create vbo an vao

        const vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectVertices), gl.STATIC_DRAW);

        const vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(vertexArrayObject);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);

        const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
        const texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

        gl.vertexAttribPointer(
            positionAttribLocation, 2,
            gl.FLOAT, false,
            4 * Float32Array.BYTES_PER_ELEMENT,  0
        );
        gl.vertexAttribPointer(
            texCoordAttribLocation, 2,
            gl.FLOAT, false,
            4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT
        );


        // create texture

        const textureElem = document.createElement('img');
        textureElem.src = testTexture;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
            gl.UNSIGNED_BYTE, textureElem
        );

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.activeTexture(gl.TEXTURE0);

        
        // unbind

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);


        let r: DrawableInitReturnType = [
            positionAttribLocation, 
            texCoordAttribLocation, 
            vertexArrayObject,
            texture
        ];
        return r;

    }

    render (program: WebGLProgram, posLoc: number, colorLoc: number, vertexArrayObject: WebGLVertexArrayObject | null) {

        const gl = this.gl;
        

        // adjust rotation, size, position and scale values to be GL-compatible
        //
        //  •  rotation: from degrees to radians
        //  •  size:     be canvas-independent
        //  •  position: be canvas-independent + begin at the bottom left corner
        //  •  scale:    from percentages to multipliers (div by 100)

        let rotAdj = transformRotCoords(this.rot);

        let [posXAdj, posYAdj] = transformPosCoords(
            this.posX, this.posY,
            CANVASW, CANVASH
        );

        let [scaleXAdj, scaleYAdj] = transformScaleCoords(this.scaleX, this.scaleY);


        // create a transform matrix

        let transform = mat3.create();

        mat3.translate (transform, transform, [posXAdj,   posYAdj]);
        mat3.scale     (transform, transform, [CANVASWC, CANVASHC]);
        mat3.rotate    (transform, transform, rotAdj);
        mat3.scale     (transform, transform, [this.width, this.height]);
        mat3.scale     (transform, transform, [scaleXAdj, scaleYAdj]);

        gl.uniformMatrix3fv(gl.getUniformLocation(program, 'transform'), false, transform);


        // color uniform

        let [r, g, b, a] = transformColor(this.colorR, this.colorG, this.colorB, this.opacity);

        gl.uniform4f(gl.getUniformLocation(program, 'color'), r, g, b, a);


        // update gl stuff

        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(colorLoc);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // render

        gl.bindVertexArray(vertexArrayObject);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

    }

}