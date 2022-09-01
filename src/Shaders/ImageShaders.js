import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from './WebGLUtilities.js';

export function renderImage(gl, canvas, image, zoom, offset, contrast, brightness) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, imageVertexSource, "image");
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, imageFragmentSource, "image");
    const program = createProgram(gl, vertShader, fragShader, "image");
    gl.useProgram(program);

    const imageDimensions = [image.width*zoom, image.height*zoom];
    //const imageDimensions = [400,400];
    //offset = [offset[0]*zoom, offset[1]*zoom];
    
    const topLeftCorner = [(canvas.width-imageDimensions[0])/2+offset[0],(canvas.height-imageDimensions[1])/2+offset[1]];
    const canCoords = [
        //first
        topLeftCorner[0],topLeftCorner[1],
        topLeftCorner[0]+imageDimensions[0],topLeftCorner[1],
        topLeftCorner[0],topLeftCorner[1]+imageDimensions[1],
        //second
        topLeftCorner[0],topLeftCorner[1]+imageDimensions[1],
        topLeftCorner[0]+imageDimensions[0],topLeftCorner[1],
        topLeftCorner[0]+imageDimensions[0],topLeftCorner[1]+imageDimensions[1]
    ];
    loadFloatAttrib(gl,program,"a_posCoord",canCoords, true, 2);

    //load offset uniform
    const topLeftCornerLocation = gl.getUniformLocation(program, "u_topLeftCorner");
    gl.uniform2f(topLeftCornerLocation, topLeftCorner[0], topLeftCorner[1]);
    //load imageRes uniform
    const imageResLocation = gl.getUniformLocation(program, "u_imageRes");
    gl.uniform2f(imageResLocation, imageDimensions[0], imageDimensions[1])
    //load canvasRes uniform
    const canvasResLocation = gl.getUniformLocation(program, "u_canvasRes");
    gl.uniform2f(canvasResLocation, canvas.width, canvas.height);

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

    //load brightness uniform
    const brightnessLocation = gl.getUniformLocation(program, "u_brightness");
    gl.uniform1f(brightnessLocation, brightness);
    //load contrast uniform
    const contrastLocation = gl.getUniformLocation(program, "u_contrast");
    gl.uniform1f(contrastLocation, contrast);

    //draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

export const imageVertexSource = `
    attribute vec2 a_posCoord;

    uniform vec2 u_topLeftCorner;
    uniform vec2 u_imageRes;
    uniform vec2 u_canvasRes;

    varying vec2 v_texCoord;

    void main() {
        vec2 pos = a_posCoord/u_canvasRes;
        pos = pos.xy * 2.0 - 1.0;
        gl_Position = vec4(pos, 1.0, 1.0);
        v_texCoord = (a_posCoord - u_topLeftCorner) / u_imageRes;
        v_texCoord.y = 1.0 - v_texCoord.y;
    }
`;

export const imageFragmentSource = `
    precision mediump float;

    //our texture
    uniform sampler2D u_image;

    uniform float u_brightness;
    uniform float u_contrast;

    //the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    mat4 brightnessMatrix(float brightness)
    {
        return mat4( 1, 0, 0, 0,
                 0, 1, 0, 0,
                 0, 0, 1, 0,
                 brightness, brightness, brightness, 1 );
    }

    mat4 contrastMatrix(float contrast)
    {
	    float t = ( 1.0 - contrast ) / 2.0;
        return mat4( contrast, 0, 0, 0,
                 0, contrast, 0, 0,
                 0, 0, contrast, 0,
                 t, t, t, 1 );
    }

    void main() {
        gl_FragColor = texture2D(u_image,v_texCoord);
        gl_FragColor = brightnessMatrix(u_brightness-1.0) * contrastMatrix(u_contrast) * gl_FragColor;
        //gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    }
`;