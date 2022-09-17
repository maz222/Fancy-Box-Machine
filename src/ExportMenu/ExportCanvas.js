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
        left:`-${appContext.image.width}px`,
        display:'none'
    };

    return(
        <div ref={wrapperRef} style={wrapperStyle}>
            <EditorCanvas width={wrapperStyle.width} height={wrapperStyle.height} exportImages={props.exportImagesCallback}/>
        </div>
    );
}

function EditorCanvas(props) {
    const appContext = useContext(AppContext);
    const canvasRef = React.useRef(null);
    const [shaderDict, setShaderDict] = React.useState(null);

    const [canvasBlobs, setCanvasBlobs] = React.useState([]);
    
    const renderLayer = (layerIndex) => {
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
        canvas.toBlob((canvasBlob) => {
            setCanvasBlobs(canvasBlobs.concat([canvasBlob]));
        })
    }

    useEffect(() => {
        if(shaderDict && canvasBlobs.length < appContext.layerManager.layers.length) {
            renderLayer(canvasBlobs.length);
        }
        if(canvasBlobs.length == appContext.layerManager.layers.length) {
            props.exportImages(canvasBlobs);
        }
    },[canvasBlobs])

    useEffect(() => {
        if(shaderDict) {
            renderLayer(0);
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
    },[canvasRef])

    return(
        <canvas id="exportCanvas" style={{width:props.width,height:props.height}} width={props.width} height={props.height} ref={canvasRef}/>
    );
    
}