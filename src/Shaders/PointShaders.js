import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from './WebGLUtilities.js';

/*
    gl :  openGl reference
    glProgram: openGL program (vertex + fragment shaders) used to render the object
    canvasData : {
        canvas: HTML Canvas Element reference
        image: the user image reference
        zoom: how zoomed into the picture the editor is (EG: 1.0 is 100% zoom, 1.5 is 150%, etc)
        offset: [x,y] raw pixel offset for the image within the canvas
    }
    pointNode:     
        ListNode subnode representing a single point placed on the canvas
        
        position: {x (float),y (float)} *normalized* (0-1) coord position within the canvas
        color: [(0-255),(0-255),(0-255)] rgb color value stored as an array
        radius: (int) the radius of the point
        glProgramKey: (string) key used to retrieve the approriate openGL program for rendering the point (in MainEditor.js) 

       lineTo: {point, color, width, shaders}
            -point: the Point Node this point is connected to (if any)
            -color: [(0-255),(0-255),(0-255)] rgb color value stored as an array. color of the line connecting the points
            -width: the width of the line connecting the two points
            -glProgramKey: (string) key used to retrieve the approriate openGL program for rendering the line (in MainEditor.js) 
*/
export function renderPointWithProgram(gl, glProgram, canvasData, pointNode) {
    gl.useProgram(glProgram);

    const imageDimensions = [canvasData.image.width*canvasData.zoom, canvasData.image.height*canvasData.zoom];
    const topLeftCorner = [(canvasData.canvas.width-imageDimensions[0])/2+canvasData.offset[0],(canvasData.canvas.height-imageDimensions[1])/2-canvasData.offset[1]];

    loadFloatAttrib(gl, glProgram, "a_pointCoord", [pointNode.position.x,pointNode.position.y], true, 2);

    const topCornerLocation = gl.getUniformLocation(glProgram, "u_imageTopLeftCorner");
    gl.uniform2f(topCornerLocation, topLeftCorner[0], topLeftCorner[1]);
    //image res uniform
    const imageResLocation = gl.getUniformLocation(glProgram, "u_imageRes");
    gl.uniform2f(imageResLocation, imageDimensions[0], imageDimensions[1]);
    //point color uniform
    const colorLocation = gl.getUniformLocation(glProgram, "u_pointColor");
    gl.uniform4f(colorLocation, pointNode.color[0]/255, pointNode.color[1]/255, pointNode.color[2]/255, 1.0);
    //point radius uniform
    const radiusLocation = gl.getUniformLocation(glProgram, "u_pointRadius");
    gl.uniform1f(radiusLocation, pointNode.radius);
    //canvas res uniform
    const canvasResLocation = gl.getUniformLocation(glProgram, "u_canvasRes");
    gl.uniform2f(canvasResLocation, canvasData.canvas.width, canvasData.canvas.height);

    const primitiveType = gl.POINTS;
    gl.drawArrays(primitiveType, 0, 1);
}

export function renderPoints(gl, canvas, image, zoom, offset, layer, pointRadius=20) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, pointVertexSource, "points");
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, pointFragmentSource, "points");
    const program = createProgram(gl, vertShader, fragShader, "points");
    gl.useProgram(program);

    const imageDimensions = [image.width*zoom, image.height*zoom];
    const topLeftCorner = [(canvas.width-imageDimensions[0])/2+offset[0],(canvas.height-imageDimensions[1])/2-offset[1]];
    const pointColor = layer.color;

    var points = [];
    for(var p in layer.points) {
        var pointX = layer.points[p][0];
        var pointY = layer.points[p][1];
        //pointX = (pointX*imageDimensions[0]+topLeftCorner[0])/canvas.width;
        //pointY = (pointY*imageDimensions[1]+topLeftCorner[1])/canvas.height;
        points.push(pointX);
        points.push(pointY);
    }
    loadFloatAttrib(gl, program, "a_pointCoord", points, true, 2);

    //corner uniform
    const topCornerLocation = gl.getUniformLocation(program, "u_imageTopLeftCorner");
    gl.uniform2f(topCornerLocation, topLeftCorner[0], topLeftCorner[1]);
    //image res uniform
    const imageResLocation = gl.getUniformLocation(program, "u_imageRes");
    gl.uniform2f(imageResLocation, imageDimensions[0], imageDimensions[1]);
    //point color uniform
    const colorLocation = gl.getUniformLocation(program, "u_pointColor");
    gl.uniform4f(colorLocation, pointColor[0]/255, pointColor[1]/255, pointColor[2]/255, 1.0);
    //point radius uniform
    const radiusLocation = gl.getUniformLocation(program, "u_pointRadius");
    gl.uniform1f(radiusLocation, pointRadius);
    //canvas res uniform
    const canvasResLocation = gl.getUniformLocation(program, "u_canvasRes");
    gl.uniform2f(canvasResLocation, canvas.width, canvas.height);

    const primitiveType = gl.POINTS;
    gl.drawArrays(primitiveType, 0, points.length/2);
}

export const pointVertexSource = `
    precision mediump float;

    //position of the point relative to the image [(0-1),(0-1)]
    attribute vec2 a_pointCoord;

    //pixel value - top left corner coordinate of the image
    uniform vec2 u_imageTopLeftCorner;
    //image dimension in pixels
    uniform vec2 u_imageRes;
    //color of the point (r,g,b,a)
    uniform vec4 u_pointColor;
    //point radius
    uniform float u_pointRadius;
    //canvas dimensions
    uniform vec2 u_canvasRes;
    
    void main() {
        vec2 normPoint = vec2((a_pointCoord*u_imageRes+u_imageTopLeftCorner)/u_canvasRes);
        gl_PointSize = u_pointRadius;
        vec2 pos = vec2(normPoint.x * 2.0 - 1.0, (normPoint.y * 2.0 - 1.0) * - 1.0);
        gl_Position = vec4(pos, 1.0, 1.0);
    }
`;

export const pointFragmentSource = `
    precision mediump float;

    //color of the point (r,g,b,a)
    uniform vec4 u_pointColor;

    void main() {
        gl_FragColor = u_pointColor;
        if(distance(gl_PointCoord.xy,vec2(0.5)) > 0.5) {
            gl_FragColor = vec4(0.0);
        }
    }
`;