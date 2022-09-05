import React from 'react';
import styled from "styled-components";

import {AppContext} from '../AppData/AppContext.js';

const TopBar = styled.div`
    display:flex;
    justify-content:space-between;
    align-items:center;
    background-color:rgb(20,20,20);
    padding-left: 7em;
`;

const TopBarButton = styled.button`
    margin:10px;
    border-radius:4px;
    color:rgb(170,170,170);
    background-color:rgba(0,0,0,0);
    border: 2px solid rgba(0,0,0,0);
    i {
        font-size:1.25em;
        padding:5px;
        margin:0;
    }
    :hover {
        cursor:pointer;
        background-color:rgb(10,10,10);
        border:2px solid black;
        color:white;
    }
`;

function TopMenu(props) {
    const appContext = React.useContext(AppContext);

    const zoomToScreen = () => {
        var frameImage = appContext.image;
        if(!frameImage) {
            return;
        }
        var canvasWidth = appContext.canvasSize[0];
        var canvasHeight = appContext.canvasSize[1];
        const widthDiff = canvasWidth - frameImage.width;
        const heightDiff = canvasHeight - frameImage.height;
        var zoom = 1;
        if(widthDiff < heightDiff) {
            zoom = canvasWidth/frameImage.width;
        }
        else {
            zoom = canvasHeight/frameImage.height;
        }
        appContext.setZoom({amount:zoom,offset:[0,0]});
    }

    return(
        <TopBar>
            <div style={{display:'flex'}}>
                <TopBarButton onClick={() => {appContext.setContrast(1)}}><i class="fa-solid fa-circle-half-stroke"></i></TopBarButton>
                <TopBarButton onClick={() => {appContext.setBrightness(1)}}><i class="fa-solid fa-sun"></i></TopBarButton>
                <TopBarButton onClick={() => {appContext.setZoom({amount:1,offset:[0,0]})}}><i class="fa-solid fa-maximize"></i></TopBarButton>
                <TopBarButton onClick={() => {zoomToScreen()}}><i class="fa-solid fa-minimize"></i></TopBarButton>
            </div>
            <div style={{'marginRight':'2em'}}>
                <TopBarButton onClick={(e) => {appContext.setExporting(true)}}><i class="fa-solid fa-download"></i></TopBarButton>
            </div>
        </TopBar>
    );
}

export default TopMenu;