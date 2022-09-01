import React from 'react';
import styled from "styled-components";

//import {AppContext} from '../AppContextProvider.js';
import { AppContext } from '../AppData/AppContext';


import {ZoomTool, MoveTool} from './Tools.js';

import { PointTool } from './NewPointTool.js';
import {AddPointTool} from './AddPointTool';
import { DebugPositionTool } from './DebugPointTool';
import DeletePointTool from './DeletePointTool';
import MovePointTool from './MovePointTool';

import {FadeButton, ToggleButton} from './ButtonTypes';

const Bar = styled.div`
    display:grid;
    grid-template-columns: 50px 50px;
    grid-template-rows: repeat(6, 50px);
    padding:5px;
    background-color:rgba(80,80,80);
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
    padding:10px;
    border:1px solid rgba(40,40,40);
    border-radius:4px;
    :hover {
        cursor:pointer;
    }
    :focus {
        background-color:red;
    }
`;

const IconContainer = styled.div`
    display:flex;
    justify-content:center;
    align-items:center;
    width:100%;
    height:100%;
    position:relative;

    .mainIcon {
        font-size:1em;
    }

    .subIcon {
        font-size:.75em;
        position:absolute;
        top:75%;
        left:75%;
    }
`

function ToolBar() {
    const appContext = React.useContext(AppContext);
    const toolMap = [
        {id:"increaseContrast", onClick:() => {appContext.setContrast(appContext.contrast+.1)}, buttonType:FadeButton ,child:
            <IconContainer>
                <i class="fa-solid fa-circle-half-stroke mainIcon"></i>
                <i class="fa-solid fa-plus subIcon"></i>
            </IconContainer>
        },
        {id:"decreaseContrast", onClick:() => {appContext.setContrast(appContext.contrast+-.1)}, buttonType:FadeButton, child:
            <IconContainer>
                <i class="fa-solid fa-circle-half-stroke mainIcon"></i>
                <i class="fa-solid fa-minus subIcon"></i>
            </IconContainer>
        },
        {id:"increaseBrightness", onClick:() => {appContext.setBrightness(appContext.brightness+.1)}, buttonType:FadeButton, child:
            <IconContainer>
                <i class="fa-solid fa-sun mainIcon"></i>
                <i class="fa-solid fa-plus subIcon"></i>
            </IconContainer>
        },
        {id:"decreaseBrightness", onClick:() => {appContext.setBrightness(appContext.brightness+-.1)}, buttonType:FadeButton, child:
            <IconContainer>
                <i class="fa-solid fa-sun mainIcon"></i>
                <i class="fa-solid fa-minus subIcon"></i>
            </IconContainer>
        },
        {id:"zoomIn", onClick:() => {appContext.setTool(new ZoomTool(+.1))}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-magnifying-glass mainIcon"></i>
                <i class="fa-solid fa-plus subIcon"></i>
            </IconContainer>
        },
        {id:"zoomOut", onClick:() => {appContext.setTool(new ZoomTool(-.1))}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-magnifying-glass mainIcon"></i>
                <i class="fa-solid fa-minus subIcon"></i>
            </IconContainer>
        },
        {id:"newPoint", onClick:() => {appContext.setTool(new PointTool())}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-pen-nib mainIcon"></i>
            </IconContainer>
        },
        {id:"addPoint", onClick:() => {appContext.setTool(new AddPointTool())}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-pen-nib mainIcon"></i>
                <i class="fa-solid fa-plus subIcon"></i>
            </IconContainer>
        },
        {id:"deletePoint", onClick:() => {appContext.setTool(new DeletePointTool())}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-pen-nib mainIcon"></i>
                <i class="fa-solid fa-minus subIcon"></i>
            </IconContainer>
        },
        {id:"movePoint", onClick:() => {appContext.setTool(new MovePointTool())}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-pen-nib mainIcon"></i>
                <i class="fa-solid fa-arrows-up-down-left-right subIcon"></i>
            </IconContainer>
        },
        {id:"moveImage", onClick:() => {appContext.setTool(new MoveTool())}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-arrows-up-down-left-right mainIcon"></i>
            </IconContainer>
        },
        {id:"debugTool", onClick:() => {appContext.setTool(new DebugPositionTool())}, buttonType:ToggleButton, child:
            <IconContainer>
                <i class="fa-solid fa-hand-pointer mainIcon"></i>
            </IconContainer>
        },
    ];
    return(
        <Bar>
            {
                toolMap.map((item,index) => {
                    return(<item.buttonType callback={item.onClick} child={item.child} active={appContext.tool.id == item.id}></item.buttonType>)
                })
            }
            
        </Bar>
    );
}

export default ToolBar;