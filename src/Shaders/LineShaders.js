import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from './WebGLUtilities.js';

//returns 6 points representing the two triangles needed to form a rectanle to represent a line
//lineStart - starting coordinate (in px)
//lineEnd - ending coordinate (in px)
//lineWidth - width of the line (in px)

//returns points IN PIXELS
function getLineCoords(lineStart, lineEnd, lineWidth) {
    const startPoint = lineStart;
    const endPoint = lineEnd;
    const vector = [endPoint[0]-startPoint[0], endPoint[1] - startPoint[1]];
    const vectorMagnitude = Math.sqrt(vector[0]**2 + vector[1]**2);
    const unitVector = [vector[0]/vectorMagnitude, vector[1]/vectorMagnitude];
    const clockwisePerpVector = [unitVector[1], -unitVector[0]];
    const counterClockPerpVector = [-unitVector[1], unitVector[0]];
    const topL = [startPoint[0]+counterClockPerpVector[0]*(lineWidth/2),startPoint[1]+counterClockPerpVector[1]*(lineWidth/2)];
    const topR = [endPoint[0]+counterClockPerpVector[0]*(lineWidth/2), endPoint[1]+counterClockPerpVector[1]*(lineWidth/2)];
    const botL = [startPoint[0]+clockwisePerpVector[0]*(lineWidth/2), startPoint[1]+clockwisePerpVector[1]*(lineWidth/2)];
    const botR = [endPoint[0]+clockwisePerpVector[0]*(lineWidth/2), endPoint[1]+clockwisePerpVector[1]*(lineWidth/2)];
    const triangle1 = [topL, topR, botL];
    const triangle2 = [topR, botR, botL];
    var points = [];
    for(var i in triangle1) {
        points.push(triangle1[i][0]);
        points.push(triangle1[i][1]);
    }
    for(var i in triangle2) {
        points.push(triangle2[i][0]);
        points.push(triangle2[i][1]);
    }
    return points;
}

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
export function renderLineWithProgram(gl, glProgram, canvasData, pointNode) {
    gl.useProgram(glProgram);

    const imageDimensions = [canvasData.image.width*canvasData.zoom, canvasData.image.height*canvasData.zoom];
    const topLeftCorner = [(canvasData.canvas.width-imageDimensions[0])/2+canvasData.offset[0],(canvasData.canvas.height-imageDimensions[1])/2-canvasData.offset[1]];

    //convert relative (0-1) points to raw pixel positions
    var pointsRaw = [];
    const points = [pointNode.position,pointNode.lineTo.position]
    for(var p in points) {
        var pointX = points[p].x;
        var pointY = points[p].y;
        pointX = (pointX*imageDimensions[0]+topLeftCorner[0])
        pointY = (pointY*imageDimensions[1]+topLeftCorner[1])
        pointsRaw.push([pointX,pointY]);
    }

    //get triangles / rectangles / line segments
    var segmentPoints = [];
    for(var i=0; i<pointsRaw.length-1; i++) {
        var linePoints = getLineCoords(pointsRaw[i],pointsRaw[i+1],pointNode.lineTo.width);
        for(var p in linePoints) {
            segmentPoints.push(linePoints[p]);
        }
    }

    loadFloatAttrib(gl,glProgram,"a_posCoord",segmentPoints,true,2);
    //load canvas resolution uniform
    const canvasResLocation = gl.getUniformLocation(glProgram, "u_canvasRes");
    gl.uniform2f(canvasResLocation, gl.canvas.width, gl.canvas.height);
    //load line color
    const lineColorLocation = gl.getUniformLocation(glProgram, "u_lineColor");
    gl.uniform4f(lineColorLocation, pointNode.lineTo.color[0]/255, pointNode.lineTo.color[1]/255, pointNode.lineTo.color[2]/255, 1.0);

    const primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, 0, segmentPoints.length/2);
}

export function renderLines(gl, canvas, image, zoom, offset, points, color, lineWidth=10) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, lineVertexSource, "lines");
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, lineFragmentSource, "lines");
    const program = createProgram(gl, vertShader, fragShader, "lines");
    gl.useProgram(program);

    const imageDimensions = [image.width*zoom, image.height*zoom];
    const topLeftCorner = [(canvas.width-imageDimensions[0])/2+offset[0],(canvas.height-imageDimensions[1])/2-offset[1]];
    const lineColor = color;

    //convert relative (0-1) points to raw pixel positions
    var pointsRaw = [];
    for(var p in points) {
        var pointX = points[p][0];
        var pointY = points[p][1];
        pointX = (pointX*imageDimensions[0]+topLeftCorner[0])
        pointY = (pointY*imageDimensions[1]+topLeftCorner[1])
        pointsRaw.push([pointX,pointY]);
    }

    //get triangles / rectangles / line segments
    var segmentPoints = [];
    for(var i=0; i<pointsRaw.length-1; i++) {
        var linePoints = getLineCoords(pointsRaw[i],pointsRaw[i+1],lineWidth);
        for(var p in linePoints) {
            segmentPoints.push(linePoints[p]);
        }
    }

    loadFloatAttrib(gl,program,"a_posCoord",segmentPoints,true,2);
    //load canvas resolution uniform
    const canvasResLocation = gl.getUniformLocation(program, "u_canvasRes");
    gl.uniform2f(canvasResLocation, gl.canvas.width, gl.canvas.height);
    //load line color
    const lineColorLocation = gl.getUniformLocation(program, "u_lineColor");
    gl.uniform4f(lineColorLocation, lineColor[0]/255, lineColor[1]/255, lineColor[2]/255, 1.0);

    const primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, 0, segmentPoints.length/2);
}

export const lineVertexSource = `
    precision mediump float;

    attribute vec2 a_posCoord;

    uniform vec2 u_canvasRes;

    void main() {
        vec2 pos = vec2((a_posCoord/u_canvasRes) * 2.0 -1.0);
        pos.y *= -1.0;
        gl_Position = vec4(pos.xy, 1.0, 1.0);
    }
`;

export const lineFragmentSource = `
    precision mediump float;

    uniform vec4 u_lineColor;

    void main() {
        gl_FragColor = u_lineColor;
    }
`;
