import React, { useEffect, useState } from 'react'
import Tool from '../Tools/Tools';
import styled from "styled-components";

import ExportMenu from '../ExportMenu/ExportMenu.js';
import TopMenu from '../TopBar/TopBar.js';
import ToolBar from '../Tools/ToolBar.js';
import LayerBar from '../LayersPane/LayerBar';
import MainEditor from '../EditorCanvas/MainEditor';

import { LayerManager } from './ImageLayer';

import { DebugConsole } from '../DebugConsole';
import LabelTrie from './LabelTrie';

export const AppContext = React.createContext({})
const ContextProvider = AppContext.Provider;

const Banner = styled.div`
  width:calc(100% - 2em);
  height:48px;
  background-color:rgb(20,20,20);
  border-bottom:2px solid black;
  display:flex;
  align-items:center;
  color:rgb(240,240,240);
  padding-left:2em;
`;

const Editor = styled.div`
  width:100%;
  height:calc(100% - 50px - 50px);
  display:flex;
  justify-content:space-between;
  align-items:center;
  background-color:rgb(10,10,10);
`

const ContextContainer = (props) => {
    const [zoom,setZoom] = useState({amount:1,offset:[0,0]});
    useEffect(() => {
        //console.log(zoom);
        if(zoom.amount < 0.1) {
            setZoom({amount:0.1,offset:zoom.offset});
        }
    },[zoom]);
    const [contrast,setContrast] = useState(1);
    useEffect(() => {
        if(contrast < 0) {
            setContrast(0);
        }
    },[contrast]);
    const [brightness,setBrightness] = useState(1);
    useEffect(() => {
        if(brightness < 0) {
            setBrightness(0);
        }
    },[brightness]);
    const [layerManager, setLayerManager] = useState(new LayerManager());
    useEffect(() => {
        //console.log(layerManager.layers);
    }, [layerManager]);
    //an index value
    const [currentLayer, setCurrentLayer] = useState(null);
    useEffect(() => {
        tool.reset();
    },[currentLayer]);
    const [tool, setTool] = useState(new Tool(AppContext));
    const [image, setImage] = useState(null);
    const [canvasSize, setCanvasSize] = useState(null);
    const [exporting, setExporting] = useState(true);

    var startingTrie = new LabelTrie();
    startingTrie.addLabel("large truck", 10);
    startingTrie.addLabel("small truck", 10);
    startingTrie.addLabel("jeep", 10);
    startingTrie.addLabel("van", 10);
    startingTrie.addLabel("car", 10);
    startingTrie.addLabel("SUV", 100);
    startingTrie.addLabel("taxi", 10);
    const [labelTrie, setLabelTrie] = useState(startingTrie);


    const [debugText, setDebugText] = useState(["testing"]);
    return(
        <div style={{width:"100%",height:"100%",position:"relative"}}>
            <ContextProvider value={{
                zoom:zoom,setZoom:setZoom,
                contrast:contrast,setContrast:setContrast,
                brightness:brightness,setBrightness:setBrightness,
                image:image,setImage:setImage,
                canvasSize:canvasSize,setCanvasSize:setCanvasSize,
                layerManager:layerManager,setLayerManager:setLayerManager,
                currentLayer:currentLayer, setCurrentLayer:setCurrentLayer,
                tool:tool,setTool:setTool,
                debugText:debugText,setDebugText:setDebugText,
                labelTrie:labelTrie,setLabelTrie:setLabelTrie,
                exporting:exporting,setExporting:setExporting
            }}>
                {exporting ? <ExportMenu /> : null}
                {debugText.length > 0 ? <DebugConsole debugText={debugText} setDebugText={setDebugText} /> : null}
                <Banner>Box Buddy</Banner>
                <TopMenu />
                <Editor>
                    <ToolBar />
                    <MainEditor/>
                    <LayerBar />
                </Editor>
            </ContextProvider>
        </div>
    )
}

export default ContextContainer
