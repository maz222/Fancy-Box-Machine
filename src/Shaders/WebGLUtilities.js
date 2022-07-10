export function createShader(gl, type, source, description="default") {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) {
        //console.log("created " + description + " shader");
        return shader;
    }
    //console.log("failed to create " + description + " shader");
    //console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}

export function createProgram(gl, vertex, fragment, description="default") {
    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program,fragment);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) {
        //console.log("created " + description + " program");
        return program;
    }
    //console.log("failed to create " + description + " program");
    //console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
}

//assumes array of floats!!!
export function loadFloatAttrib(gl,program,attributeName,attributeData,isStatic,size,normalize=false,stride=0,offset=0) {
    const attribLocation = gl.getAttribLocation(program, attributeName);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributeData), isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(attribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribLocation, size, gl.FLOAT, normalize, stride, offset);
    return buffer;
}

export function printAttributes(program, gl) {
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let ii = 0; ii < numAttribs; ++ii) {
    const attribInfo = gl.getActiveAttrib(program, ii);
    const index = gl.getAttribLocation(program, attribInfo.name);
    }
}

export function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    const data = [
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}