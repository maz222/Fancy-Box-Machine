import { render } from '@testing-library/react';
import React, { useContext, useEffect } from 'react';
import styled from "styled-components";

import { AppContext } from '../AppData/AppContext';
import { AppSettings } from '../AppData/AppSettings';

import {printAttributes, createShader, createProgram, loadFloatAttrib, setRectangle} from '../Shaders/WebGLUtilities.js';
import {exportVertexSource, getExportFragmentSource, renderExportLayerWithProgram} from '../Shaders/ExportShaders';


export default function ExportPane(props) {
    const appContext = React.useContext(AppContext);
    const wrapperRef = React.useRef(null);

    const wrapperStyle = {
        height:appContext.image.height+"px",
        width:appContext.image.width+"px",
        //height:1000+"px",
        //width:400+"px",
        position:"absolute",
        top:"20px",
        left:"20px"
    };

    console.log([wrapperStyle.width,wrapperStyle.height]);
    console.log("**");

    return(
        <div ref={wrapperRef} style={wrapperStyle}>
            <EditorCanvas width={wrapperStyle.width} height={wrapperStyle.height}/>
        </div>
    );
}

function EditorCanvas(props) {
    const appContext = useContext(AppContext);
    const canvasRef = React.useRef(null);
    const [frameImage, setFrameImage] = React.useState(null);
    const [shaderDict, setShaderDict] = React.useState(null);
    const [redrawCanvas, setRedrawCanvas] = React.useState(false);

    const [canvasBlobs, setCanvasBlobs] = React.useState({blobs:[]});
    const [layersToRender, setLayersToRender] = React.useState(0);
    
    const renderCanvas = (layerIndex) => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl2");
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendEquation(gl.GL_FUNC_ADD);        
        gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const canvasData = {
            canvas:canvasRef.current,
            image:AppContext.image,
        };
        renderExportLayerWithProgram(gl, shaderDict.export, canvasData, appContext.layerManager.layers[layerIndex], appContext.image);
        setRedrawCanvas(false);
    }

    useEffect(() => {
        if(shaderDict) {
            setRedrawCanvas(true);
        }
    },[shaderDict])

    useEffect(() => {
        if(canvasRef === null) {
            return;
        }
        var maxPoints = AppSettings.polyBasePoints;
        appContext.layerManager.layers.forEach((layer,index) => {
            maxPoints = Math.max(maxPoints,layer.points.length);
        });
        console.log("compiling shaders?");
        const gl = canvasRef.current.getContext("webgl2");
        const shaderList = [
            //export images shader
            {vert:exportVertexSource,frag:getExportFragmentSource(maxPoints),name:"export"}
        ];
        var temp = {};
        for(var i in shaderList) {
            const vertShader = createShader(gl, gl.VERTEX_SHADER, shaderList[i].vert, shaderList[i].name);
            const fragShader = createShader(gl, gl.FRAGMENT_SHADER, shaderList[i].frag, shaderList[i].name);
            const program = createProgram(gl, vertShader, fragShader, shaderList[i].name);
            temp[shaderList[i].name] = program;
        }
        setShaderDict(temp);
        //setRedrawCanvas(true);
    },[canvasRef])

    useEffect(() => {
        if(redrawCanvas) {
            renderCanvas(0);
        }
    },[redrawCanvas])

    console.log([props.width,props.height]);
    console.log(props);
    console.log("---")
    return(
        <canvas id="exportCanvas" style={{width:props.width,height:props.height}} width={props.width} height={props.height} ref={canvasRef}/>
    );
    

    /*
    return(
        <canvas id="exportCanvas" style={{width:"400px",height:"1000px"}} width={"400px"} height={"1000px"} ref={canvasRef}/>
    );
    */
}