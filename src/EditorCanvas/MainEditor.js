import React, { useContext, useEffect } from 'react';
import styled from "styled-components";

import { AppContext } from '../AppData/AppContext';
import { AppSettings } from '../AppData/AppSettings';

//import {printAttributes, createShader, createProgram, loadFloatAttrib} from './WebGLUtilities.js';
import {renderBackground} from '../Shaders/BackgroundShaders.js';
import {renderImage} from '../Shaders/ImageShaders.js';
import {renderLineWithProgram} from '../Shaders/LineShaders.js';
import {renderPointWithProgram} from '../Shaders/PointShaders.js';
import {renderPolygonWithProgram} from '../Shaders/PolygonShaders';

import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from '../Shaders/WebGLUtilities.js';
import {lineVertexSource, lineFragmentSource} from '../Shaders/LineShaders.js';
import {pointVertexSource, pointFragmentSource} from '../Shaders/PointShaders.js';
import {imageVertexSource, imageFragmentSource} from '../Shaders/ImageShaders.js';
import {polygonVertexSource, getPolygonFragmentSource, polygonFragmentSource} from '../Shaders/PolygonShaders';

const Wrapper = styled.div`
    display:flex;
    flex-grow:1;
    justify-content:center;
    align-items:center;
    height:100%;
`;

function MainEditor(props) {
    const appContext = React.useContext(AppContext);
    const wrapperRef = React.useRef(null);
    return(
        <Wrapper ref={wrapperRef}>
            {appContext.image == null ? 
                <input type="file" accept="image/*" onChange={(e) => appContext.setImage(e.target.files[0])}></input> : 
                <EditorCanvas wrapperRef={wrapperRef}/>
            }
        </Wrapper>
    );
}


/*
    shaderDict : dictionary of openGL programs (vertex + fragment shader) used to render cavnas objects
        -Each key is a string representing what type of object (EG: "point","line", etc)
        -PointNodes in the point array will have a one of the keys as a value, used to retrieve the program at draw time
*/
function EditorCanvas(props) {
    const appContext = useContext(AppContext);
    const canvasRef = React.useRef(null);
    const [frameImage, setFrameImage] = React.useState(null);
    const [shaderDict, setShaderDict] = React.useState(null);
    const [redrawCanvas, setRedrawCanvas] = React.useState(false);

    const drawPoints = (context, gl, pointArray) => {
        const canvasData = {
            canvas:canvasRef.current,
            image:context.image,
            zoom:context.zoom.amount,
            offset:context.zoom.offset,
        };
        for(var i in pointArray) {
            renderPointWithProgram(gl,shaderDict[pointArray[i].glProgramKey],canvasData,pointArray[i]);
        }
    }

    const drawLines = (context, gl, pointArray) => {
        const canvasData = {
            canvas:canvasRef.current,
            image:context.image,
            zoom:context.zoom.amount,
            offset:context.zoom.offset,
        };
        for(var i in pointArray) {
            if(pointArray[i].lineTo !== null) {
                renderLineWithProgram(gl,shaderDict[pointArray[i].lineTo.glProgramKey],canvasData,pointArray[i]);
            }
        }
    }

    const drawPoly = (context, gl, layer) => {
        const canvasData = {
            canvas:canvasRef.current,
            image:context.image,
            zoom:context.zoom.amount,
            offset:context.zoom.offset,
        };
        if(!layer.polygon) {
            return;
        }
        if(layer.points.length > AppSettings.polyBasePoints) {
            var tempDict = {};
            Object.keys(shaderDict).forEach((key,index) => {
                tempDict[key] = shaderDict[key];
            });
            var polyData = {vert:polygonVertexSource,frag:getPolygonFragmentSource(AppSettings.polyBasePoints),name:"polygon"};
            const vertShader = createShader(gl, gl.VERTEX_SHADER, polyData.vert, polyData.name);
            const fragShader = createShader(gl, gl.FRAGMENT_SHADER, polyData.frag, polyData.name);
            const program = createProgram(gl, vertShader, fragShader, polyData.name);
            tempDict[polyData.name] = program;
            setShaderDict(tempDict);
            setRedrawCanvas(true);
        }
        renderPolygonWithProgram(gl,shaderDict[layer.glProgramKey],canvasData,layer);
    }

    const renderCanvas = () => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl2");
        //const gl = canvas.getContext("webgl", {
        //    premultipliedAlpha: false  // Ask for non-premultiplied alpha
        // });
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendEquation(gl.GL_FUNC_ADD);        
        gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0,0.0,0.0,1,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        //renderBackground(gl);
        renderImage(gl, canvas, appContext.image, appContext.zoom.amount, appContext.zoom.offset, appContext.contrast, appContext.brightness);
        //console.log(appContext.layers);
        for(var l in appContext.layerManager.layers) {
            const currLayer = appContext.layerManager.layers[l];
            var currPoints = currLayer.points;
            if(currLayer.visibility) {
                if(l == appContext.currentLayer) {
                    var clonedLayer = currLayer.clone();
                    clonedLayer = appContext.tool.checkLayerForRender(clonedLayer);
                    currPoints = clonedLayer.points;
                }
                drawPoints(appContext, gl, currPoints);
                drawLines(appContext, gl, currPoints);
                drawPoly(appContext, gl, currLayer);
            }
        }
        //console.log(appContext.layers);
        setRedrawCanvas(false);
    };

    //if the canvas changes, re compile shaders using the new canvas
    useEffect(() => {
        if(canvasRef === null) {
            return;
        }
        console.log("compiling shaders?");
        const gl = canvasRef.current.getContext("webgl2");
        const shaderList = [
            //image shader
            {vert:imageVertexSource,frag:imageFragmentSource,name:"image"},
            //point shader
            {vert:pointVertexSource,frag:pointFragmentSource,name:"point"},
            //line shader
            {vert:lineVertexSource,frag:lineFragmentSource,name:"line"},
            //polygon shader
            {vert:polygonVertexSource,frag:getPolygonFragmentSource(AppSettings.polyBasePoints),name:"polygon"}
        ];
        var temp = {};
        for(var i in shaderList) {
            console.log(shaderList[i].name);
            const vertShader = createShader(gl, gl.VERTEX_SHADER, shaderList[i].vert, shaderList[i].name);
            const fragShader = createShader(gl, gl.FRAGMENT_SHADER, shaderList[i].frag, shaderList[i].name);
            const program = createProgram(gl, vertShader, fragShader, shaderList[i].name);
            temp[shaderList[i].name] = program;
        }
        setShaderDict(temp);
    },[canvasRef])

    useEffect(() => {
        if(frameImage != null && shaderDict != null) {
            setRedrawCanvas(true);
        }
    },[appContext.layerManager, appContext.zoom, appContext.brightness, appContext.contrast, appContext.tool]);

    useEffect(() => {
        if(redrawCanvas) {renderCanvas();}
    },[redrawCanvas]);

    useEffect(() => {
        const canvas = canvasRef.current;
        appContext.setCanvasSize([canvas.width,canvas.height]);
        var fileReader = new FileReader();
        var tempImage = new Image();
        fileReader.onload = () => {
            tempImage.src = fileReader.result;
        }
        fileReader.readAsDataURL(appContext.image);
        tempImage.onload = () => {
            //console.log("image loaded");
            //console.log(tempImage.width);
            //console.log(tempImage.height);
            appContext.setImage(tempImage);
            setFrameImage(tempImage);
            setRedrawCanvas(true);
        }
    }, []);
    return(
        <canvas id="editorCanvas" style={{width:"100%",height:"100%",cursor:appContext.tool.cursor}} width={props.wrapperRef.current.offsetWidth} height={props.wrapperRef.current.offsetHeight} ref={canvasRef} 
        onMouseDown={(e) => {setRedrawCanvas(appContext.tool.handleMouseDown(e,canvasRef.current,appContext))}}
        onMouseUp={(e) => {setRedrawCanvas(appContext.tool.handleMouseUp(e,canvasRef.current,appContext))}}
        onMouseMove={(e) => {setRedrawCanvas(appContext.tool.handleMouseMove(e,canvasRef.current,appContext))}}
        />
    );
};

export default MainEditor;