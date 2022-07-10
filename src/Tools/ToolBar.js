import React from 'react';
import styled from "styled-components";

//import {AppContext} from '../AppContextProvider.js';
import { AppContext } from '../AppData/AppContext';


import {ZoomTool, MoveTool} from './Tools.js';
import { PointTool } from './AddPointTool.js';

const Bar = styled.div`
    display:grid;
    grid-template-columns: 50px 50px;
    grid-template-rows: repeat(5, 50px);
    padding:5px;
    background-color:white;
    width:calc(50px * 2 + 10);
    height:calc(100% - 10px);
`;

const ToolButton = styled.button`
    display:flex;
    justify-content:center;
    align-items:center;
    flex-grow:1;
    font-size:1vw;
    margin:2px;
`;

function ToolBar() {
    const appContext = React.useContext(AppContext);
    const toolMap = [
        {id:"increaseContrast", onClick:() => {appContext.setContrast(appContext.contrast+.1)}, child:<i class="fas fa-plus"></i>},
        {id:"decreaseContrast", onClick:() => {appContext.setContrast(appContext.contrast+-.1)}, child:<i class="fas fa-minus"></i>},
        {id:"increaseBrightness", onClick:() => {appContext.setBrightness(appContext.brightness+.1)}, child:<i class="fas fa-plus"></i>},
        {id:"decreaseBrightness", onClick:() => {appContext.setBrightness(appContext.brightness+-.1)}, child:<i class="fas fa-minus"></i>},
        {id:"zoomOut", onClick:() => {appContext.setTool(new ZoomTool(-.1))}, child:<i class="fas fa-search-minus"></i>},
        {id:"zoomIn", onClick:() => {appContext.setTool(new ZoomTool(+.1))}, child:<i class="fas fa-search-plus"></i>},
        {id:"pen", onClick:() => {appContext.setTool(new PointTool())}, child:<i class="fas fa-pen"></i>},
        {id:"movePoint", onClick:() => {}, child:<i class="fas fa-draw-polygon"></i>},
        {id:"moveImage", onClick:() => {appContext.setTool(new MoveTool())}, child:<i class="fas fa-hand-pointer"></i>}
    ];
    return(
        <Bar>
            {
                toolMap.map((item,index) => {
                    return(<ToolButton onClick={item.onClick}>{item.child}</ToolButton>)
                })
            }
            
        </Bar>
    );
}

export default ToolBar;

/*
            <Tool onClick={() => {appContext.setContrast(appContext.contrast+.1)}}>
                <i class="fas fa-plus"></i>
            </Tool>
            <Tool onClick={() => {appContext.setContrast(appContext.contrast-.1)}}>
                <i class="fas fa-minus"></i>
            </Tool>
            <Tool onClick={() => {appContext.setBrightness(appContext.brightness+.1)}}>
                <i class="fas fa-plus"></i>
            </Tool>
            <Tool onClick={() => {appContext.setBrightness(appContext.brightness-.1)}}>
                <i class="fas fa-minus"></i>
            </Tool>
            <Tool onClick={() => {
                appContext.setCurrentTool(new ZoomTool(appContext,-.1))}}>
                <i class="fas fa-search-minus"></i>
            </Tool>
            <Tool onClick={() => {appContext.setCurrentTool(new ZoomTool(appContext,.1))}}>
                <i class="fas fa-search-plus"></i>
            </Tool>
            <Tool onClick={() => {appContext.setCurrentTool(new PointTool(appContext))}}>                    
                <i class="fas fa-mouse"></i>
            </Tool>
            <Tool>
                <i class="fas fa-pen"></i>
            </Tool>
            <Tool>
                <i class="fas fa-draw-polygon"></i>
            </Tool>
            <Tool onClick={() => {appContext.setCurrentTool(new MoveTool(appContext))}}>
                <i class="fas fa-hand-pointer"></i>            
            </Tool>
*/