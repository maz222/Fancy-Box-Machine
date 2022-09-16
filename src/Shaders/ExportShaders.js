import { getRect, flattenPoints } from './PolygonShaders.js';
import { loadFloatAttrib } from "./WebGLUtilities";

export function renderExportLayerWithProgram(gl, glProgram, canvasData, layer, image) {
    gl.useProgram(glProgram);
    var points = [];
    layer.points.forEach((point,index) => {
        points.push({x:point.position.x,y:point.position.y});
    });
    const rectPoints = getRect(points);
    //const rectPoints = [0,1,1,1,0,.5,0,.5,1,1,1,.5];
    loadFloatAttrib(gl,glProgram,"a_posCoord",rectPoints,true,2);

    //load canvas resolution uniform
    const canvasResLocation = gl.getUniformLocation(glProgram, "u_canvasRes");
    gl.uniform2f(canvasResLocation, gl.canvas.width, gl.canvas.height);
    //load point count uniform
    const pointCountLocation = gl.getUniformLocation(glProgram, "u_pointCount");
    gl.uniform1i(pointCountLocation,layer.points.length);
    //load points uniform
    const pointsLocation = gl.getUniformLocation(glProgram, "u_points");
    gl.uniform2fv(pointsLocation,flattenPoints(points));
    //load first point uniform
    const firstPointLocation = gl.getUniformLocation(glProgram, "u_firstPoint");
    gl.uniform2f(firstPointLocation, points[0].x, 1.0 - points[0].y);
    //load last point uniform
    const lastPointLocation = gl.getUniformLocation(glProgram, "u_lastPoint");
    gl.uniform2f(lastPointLocation, points[points.length-1].x, 1.0 - points[points.length-1].y);
    //load image uniform
    //create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    //draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);  
}

export const exportVertexSource = `
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

export function getExportFragmentSource(maxPointCount) {
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
                //image bitmap
                uniform sampler2D u_image;

                void main() {
                    vec2 normPos = gl_FragCoord.xy / u_canvasRes;
                    float c = 0.0;
                    ${rayLoop}
                    if(((u_firstPoint.y > normPos.y) != (u_lastPoint.y>normPos.y)) &&
                        (normPos.x < (u_lastPoint.x - u_firstPoint.x) * (normPos.y-u_firstPoint.y) / (u_lastPoint.y - u_firstPoint.y) + u_firstPoint.x)) {
                        c = c + 1.0;
                    }
                    c = mod(c,2.0);
                    vec2 textPos = vec2(normPos.x, 1.0 - normPos.y);
                    gl_FragColor = vec4(c*texture2D(u_image,textPos));
                }
    `)
}