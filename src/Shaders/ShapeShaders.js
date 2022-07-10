import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from './WebGLUtilities.js';

export function renderShape(gl, canvas, image, zoom, offset, layer) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, shapeVertexSource, "shapes");
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, shapeFragmentSource, "shapes");
    const program = createProgram(gl, vertShader, fragShader, "shapes");
    gl.useProgram(program);

    const imageDimensions = [image.width*zoom, image.height*zoom];
    const topLeftCorner = [(canvas.width-imageDimensions[0])/2+offset[0],(canvas.height-imageDimensions[1])/2-offset[1]];
    const shapeColor = layer.color;

    var points = [];
    for(var p in layer.points) {
        for(var i in layer.points[p]) {
            points.push(layer.points[p][i]);
        }
    }
    points.push(points[0][0]);
    points.push(points[0][1]);
    loadFloatAttrib(gl,program,"a_posCoord",points,true,2);

    //corner uniform
    const topCornerLocation = gl.getUniformLocation(program, "u_imageTopLeftCorner");
    gl.uniform2f(topCornerLocation, topLeftCorner[0], topLeftCorner[1]);
    //image res uniform
    const imageResLocation = gl.getUniformLocation(program, "u_imageRes");
    gl.uniform2f(imageResLocation, imageDimensions[0], imageDimensions[1]);
    //point color uniform
    const colorLocation = gl.getUniformLocation(program, "u_shapeColor");
    gl.uniform3f(colorLocation, shapeColor[0]/255, shapeColor[1]/255, shapeColor[2]/255);
    //canvas res uniform
    const canvasResLocation = gl.getUniformLocation(program, "u_canvasRes");
    gl.uniform2f(canvasResLocation, canvas.width, canvas.height);

    const primitiveType = gl.POLYGON;
    gl.drawArrays(primitiveType, 0, points.length/2);
}

export const shapeVertexSource = `
    precision mediump float;

    //position of the point relative to the image [(0-1),(0-1)]
    attribute vec2 a_posCoord;

    //pixel value - top left corner coordinate of the image
    uniform vec2 u_imageTopLeftCorner;
    //image dimension in pixels
    uniform vec2 u_imageRes;
    //color of the point (r,g,b,a)
    uniform vec4 u_pointColor;
    //canvas dimensions
    uniform vec2 u_canvasRes;

    void main() {
        vec2 normPoint = vec2((a_posCoord*u_imageRes+u_imageTopLeftCorner)/u_canvasRes);
        vec2 pos = vec2(normPoint.x * 2.0 - 1.0, (normPoint.y * 2.0 - 1.0) * - 1.0);
        gl_Position = vec4(pos, 1.0, 1.0);
    }
`;

export const shapeFragmentSource = `
    precision mediump float;

    uniform vec3 u_shapeColor;

    void main() {
        gl_FragColor = vec4(u_shapeColor, 0.5);
        //gl_FragColor = vec4(1.0);
    }

`;