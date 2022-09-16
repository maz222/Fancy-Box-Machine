import { loadFloatAttrib } from "./WebGLUtilities";

//gets a set of 6 points - two triangles that make up the outermost rectangle of the polygon
export function getRect(points) {
    var top = points[0].y;
    var bottom = points[0].y;
    var left = points[0].x;
    var right = points[0].x;
    //box orientation
    /*
        1*
         *
         *  
        0*******1 
    */
    points.forEach((point,index) => {
        top = Math.max(top,point.y);
        bottom = Math.min(bottom,point.y);
        left = Math.min(left,point.x);
        right = Math.max(right,point.x);
    });
    //corner points
    /*
        3 * * 2
        *     *
        *     *
        0 * * 1 
    */
    //return [{x:left,y:bottom},{x:right,y:bottom},{x:right,y:top},{x:left,y:top}];
    return([
        //first triangle [3,2,0]
        left,top,
        right,top,
        left,bottom,
        //second triangle [0,2,1]
        left,bottom,
        right,top,
        right,bottom
    ]);
}

export function flattenPoints(points) {
    var out = [];
    points.forEach((point,index) => {
        out.push(point.x);
        out.push(1.0 - point.y);
    });
    return out;
}

function parsePoints(layer,canvasData) {
    const imageDimensions = [canvasData.image.width*canvasData.zoom, canvasData.image.height*canvasData.zoom];
    const topLeftCorner = [(canvasData.canvas.width-imageDimensions[0])/2+canvasData.offset[0],(canvasData.canvas.height-imageDimensions[1])/2-canvasData.offset[1]];
    var parsedPoints = [];
    layer.points.forEach((point,index) => {
        parsedPoints.push({x:(point.position.x*imageDimensions[0]+topLeftCorner[0])/canvasData.canvas.width,
            y:(point.position.y*imageDimensions[1]+topLeftCorner[1])/canvasData.canvas.height});
    });
    return parsedPoints;
}

export function renderPolygonWithProgram(gl, glProgram, canvasData, layer, opactity=null) {
    gl.useProgram(glProgram);
    var parsedPoints = parsePoints(layer,canvasData);
    var points = getRect(parsedPoints);
    loadFloatAttrib(gl,glProgram,"a_posCoord",points,true,2);

    //load canvas resolution uniform
    const canvasResLocation = gl.getUniformLocation(glProgram, "u_canvasRes");
    gl.uniform2f(canvasResLocation, gl.canvas.width, gl.canvas.height);
    //load point count uniform
    const pointCountLocation = gl.getUniformLocation(glProgram, "u_pointCount");
    gl.uniform1i(pointCountLocation,layer.points.length);
    //load points uniform
    const pointsLocation = gl.getUniformLocation(glProgram, "u_points");
    gl.uniform2fv(pointsLocation,flattenPoints(parsedPoints));
    //load first point uniform
    const firstPointLocation = gl.getUniformLocation(glProgram, "u_firstPoint");
    gl.uniform2f(firstPointLocation, parsedPoints[0].x, 1.0 - parsedPoints[0].y);
    //load last point uniform
    const lastPointLocation = gl.getUniformLocation(glProgram, "u_lastPoint");
    gl.uniform2f(lastPointLocation, parsedPoints[parsedPoints.length-1].x, 1.0 - parsedPoints[parsedPoints.length-1].y);
    //load line color
    const polygonColorLocation = gl.getUniformLocation(glProgram, "u_polyColor");
    gl.uniform4f(polygonColorLocation, layer.color[0]/255, layer.color[1]/255, layer.color[2]/255, opactity ? opactity : 1.0);

    //draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);    
}

export const polygonVertexSource = `
    precision mediump float;

    //rect corner (in pixels)
    attribute vec2 a_posCoord;

    //canvas resolution (in pixels)
    uniform vec2 u_canvasRes;

    void main() {
        vec2 pos = vec2(a_posCoord * 2.0 - 1.0);
        pos.y *= -1.0;
        gl_Position = vec4(pos.xy, 1.0, 1.0);
    }
`;

//sets point array to an arbitrary max length. If exceeded, need to recompile the shader in the editor component before rendering
export function getPolygonFragmentSource(maxPointCount) {
    var rayLoop = '';
    var i, j = 0;
    for(i=0; i<maxPointCount-1; i++) {
        j = i + 1;
        rayLoop += 
                `if((${j} < u_pointCount) && 
                    ((u_points[${i}].y > normPos.y) != (u_points[${j}].y>normPos.y)) &&
                    (normPos.x < (u_points[${j}].x - u_points[${i}].x) * (normPos.y-u_points[${i}].y) / (u_points[${j}].y - u_points[${i}].y) + u_points[${i}].x)) {
                    c = c + 1.0;
                }`;
    }
    return(`
        precision mediump float;

        //how many points are present in the polygon
        uniform int u_pointCount;
        //array of *normalized* point positions
        uniform vec2 u_points[${maxPointCount}];
        //first point of the polygon
        uniform vec2 u_firstPoint;
        //last point of the polygon
        uniform vec2 u_lastPoint;
        //canvas resolution (in pixels)
        uniform vec2 u_canvasRes;
        //polygon color (0-1, 0-1, 0-1, 0-1)
        uniform vec4 u_polyColor;

        void main() {
            vec2 normPos = gl_FragCoord.xy / u_canvasRes;
            float c = 0.0;
            ${rayLoop}
            if(((u_firstPoint.y > normPos.y) != (u_lastPoint.y>normPos.y)) &&
                (normPos.x < (u_lastPoint.x - u_firstPoint.x) * (normPos.y-u_firstPoint.y) / (u_lastPoint.y - u_firstPoint.y) + u_firstPoint.x)) {
                c = c + 1.0;
            }
            c = mod(c,2.0);
            gl_FragColor = vec4(c*u_polyColor);
        }
    `);
}
