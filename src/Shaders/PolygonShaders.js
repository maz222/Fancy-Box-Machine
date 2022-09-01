import { loadFloatAttrib } from "./WebGLUtilities";

//gets a set of 6 points - two triangles that make up the outermost rectangle of the polygon
function getRect(points) {
    var top = points[0].position.y;
    var bottom = points[0].position.y;
    var left = points[0].position.x;
    var right = points[0].position.x;
    //box orientation
    /*
        1*
         *
         *  
        0*******1 
    */
    points.forEach((point,index) => {
        const pos = point.position;
        top = Math.max(top,pos.y);
        bottom = Math.min(bottom,pos.y);
        left = Math.min(left,pos.x);
        right = Math.max(right,pos.x);
    })
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

function flattenPoints(points) {
    var out = [];
    points.forEach((point,index) => {
        out.push(point.position.x);
        out.push(point.position.y);
    });
    return out;
}

export function renderPolygonWithProgram(gl, glProgram, canvasData, layer) {
    gl.useProgram(glProgram);

    var points = getRect(layer.points);
    points = [0,1 ,1,1 ,0,0 ,0,0 ,1,1, 1,0];
    loadFloatAttrib(gl,glProgram,"a_posCoord",points,true,2);

    //load canvas resolution uniform
    const canvasResLocation = gl.getUniformLocation(glProgram, "u_canvasRes");
    gl.uniform2f(canvasResLocation, gl.canvas.width, gl.canvas.height);
    //load point count uniform
    const pointCountLocation = gl.getUniformLocation(glProgram, "u_pointCount");
    gl.uniform1i(pointCountLocation,layer.points.length);
    //load points uniform
    const pointsLocation = gl.getUniformLocation(glProgram, "u_points");
    gl.uniform2fv(pointsLocation,flattenPoints(layer.points));
    //load line color
    const polygonColorLocation = gl.getUniformLocation(glProgram, "u_polyColor");
    gl.uniform4f(polygonColorLocation, layer.color[0]/255, layer.color[1]/255, layer.color[2]/255, 1.0);

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
    for(i=0, j=maxPointCount-1; i<maxPointCount; j=i++) {
        rayLoop += 
            `if((${i} < u_pointCount) && ((u_points[${i}].y > normFrag.y) != (u_points[${j}].y>normFrag.y)) &&
                (normFrag.x < (u_points[${j}].x - u_points[${i}].x) * (normFrag.y-u_points[${i}].y) / (u_points[${j}].y - u_points[${i}].y) + u_points[${i}].x)) {
                c = c + 1.0;
            }`;
    }
    return(`
        precision mediump float;

        //how many points are present in the polygon
        uniform int u_pointCount;
        //array of *normalized* point positions
        uniform vec2 u_points[${maxPointCount}];
        //canvas resolution (in pixels)
        uniform vec2 u_canvasRes;
        //polygon color (0-1, 0-1, 0-1, 0-1)
        uniform vec4 u_polyColor;

        void main() {
            vec2 normFrag = vec2(gl_FragCoord.xy / u_canvasRes);
            float c = 0.0;
            ${rayLoop}
            c = mod(c,2.0);
            gl_FragColor = vec4(c*u_polyColor);
        }
    `);
}

/*
            vec2 normFrag = vec2(gl_FragCoord.xy / u_canvasRes);
            float c = 0.0;
            ${rayLoop}
            c = mod(c,2.0);
            gl_FragColor = vec4(c*u_polyColor);
*/

export const polygonFragmentSource = `
    precision mediump float;

    //how many points are present in the polygon
    uniform int u_pointCount;
    //array of *normalized* point positions
    uniform vec2 u_points[200];
    //canvas resolution (in pixels)
    uniform vec2 u_canvasRes;
    //polygon color (0-1, 0-1, 0-1, 0-1)
    uniform vec4 u_polyColor;

    void main() {
        int i, j;
        float c = 0.0;
        vec2 normFrag = vec2(gl_FragCoord.xy / u_canvasRes);
        for(i=0;i<5;i++) {
            c += 1.0;
        }
 }       if(mod(c,2.0) != 0.0) {
            gl_FragColor = u_polyColor;
        }
        else {
            gl_FragColor = vec4(0.0);
        }
    
`

/*
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    int pointCount = 5;
    //float xPoints[5] = float[](0.0,200.0,300.0,200.0,200.0);
    //float yPoints[5] = float[](0.0,0.0, 100.0,200.0,100.0);
    
    vec2 u_points[5] = vec2[](vec2(0.0,0.0),vec2(200.0,0.0),vec2(300.0,100.0),vec2(200.0,200.0),vec2(200.0,100.0));
    
    int i, j = 0;
    float c = 0.0;

    c = 0.0;
    for(i=0, j=pointCount-1; i<pointCount; j=i++) {
        if(((u_points[i].y > fragCoord.y) != (u_points[j].y>fragCoord.y)) &&
            (fragCoord.x < (u_points[j].x - u_points[i].x) * (fragCoord.y-u_points[i].y) / (u_points[j].y - u_points[i].y) + u_points[i].x)) {
                c = c + 1.0;
        }
    }
    
    if(mod(c,2.0) != 0.0) {
        fragColor = vec4(0.0,0.0,0.0,1.0);
    }
    else {
        fragColor = vec4(1.0);
    }  
}
*/