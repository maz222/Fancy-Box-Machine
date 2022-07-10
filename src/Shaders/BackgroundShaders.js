import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from './WebGLUtilities.js';

export function renderBackground(gl) {
    const backgroundVert = createShader(gl, gl.VERTEX_SHADER, backgroundVertSource, "background");
    const backgroundFrag = createShader(gl, gl.FRAGMENT_SHADER, backgroundFragSource, "background");
    const program = createProgram(gl, backgroundVert, backgroundFrag, "background");
    gl.useProgram(program);

    const canCoords = [
        //first traingle
        0.0,  0.0,
        gl.canvas.width,  0.0,
        0.0,  gl.canvas.height,
        //second triangle
        0.0,  gl.canvas.height,
        gl.canvas.width,  0.0,
        gl.canvas.width,  gl.canvas.height, 
    ];

    loadFloatAttrib(gl,program,"a_posCoord",canCoords,true,2);
    
    //load canvas resolution uniform
    const canvasResLocation = gl.getUniformLocation(program, "u_canResolution");
    gl.uniform2f(canvasResLocation, gl.canvas.width, gl.canvas.height);
    //load box resolution uniform
    const boxResLocation = gl.getUniformLocation(program, "u_boxResolution");
    gl.uniform1f(boxResLocation,8);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

export const backgroundVertSource = `
    attribute vec2 a_posCoord;

    varying vec2 v_canCoord;

    void main() {
        vec2 pos = a_posCoord.xy * 2.0 - 1.0;
        gl_Position = vec4(pos, 1.0, 1.0);
        v_canCoord = pos;
    }
`;

export const backgroundFragSource = `
    precision mediump float;
    //size of background 'box' cells %! assume boxes are squares.
    uniform float u_boxResolution;
    //overall canvas size [width, height] in px!
    uniform vec2 u_canResolution;
    
    //canvas coordinate [width, height] in %!
    varying vec2 v_canCoord;

    void main() {
        vec4 white = vec4(1.0);
        vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
        float boxSize = min(u_canResolution.x * u_boxResolution/100.0, u_canResolution.y * u_boxResolution/100.0);
        //x / y offset, if canvas isn't a perfect square
        //vec2 canvasPadding = vec2((u_canResolution - floor(u_canResolution / u_boxResolution) * u_boxResolution)/2.0);

        vec2 posPX = v_canCoord*u_canResolution;
        vec2 boxIndex = vec2(0.0);
        boxIndex.x = mod(floor(posPX.x/boxSize),2.0);
        boxIndex.y = mod(floor(posPX.y/boxSize),2.0);
        if(boxIndex.x == boxIndex.y) {
            gl_FragColor = black;
        }
        else {
            gl_FragColor = white;
        }
    }
`;