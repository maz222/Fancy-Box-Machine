import React from 'react';
import styled from "styled-components";

import {AppContext} from '../AppData/AppContext.js';

const TopBar = styled.div`
    display:flex;
    justify-content:space-between;
    align-items:center;
    background-color:rgb(60,60,60);
    height:50px;
`;

const TopBarButton = styled.button`
    padding:2px 4px 2px 4px;
    margin:4px;
`;

function TopMenu(props) {
    const appContext = React.useContext(AppContext);

    const zoomToScreen = () => {
        var frameImage = appContext.image;
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
                <div style={{margin:'4px'}}>
                    <TopBarButton onClick={() => {appContext.setContrast(1)}}>100% Contrast</TopBarButton>
                    <TopBarButton onClick={() => {appContext.setBrightness(1)}}>100% Brightness</TopBarButton>
                </div>
                <div style={{margin:'4px'}}>
                    <TopBarButton onClick={() => {appContext.setZoom({amount:1,offset:[0,0]})}}>100% Zoom</TopBarButton>
                    <TopBarButton onClick={() => {zoomToScreen()}}>Fit to Screen</TopBarButton>
                </div>
            </div>
            <div>
                <TopBarButton>Get Script</TopBarButton>
            </div>
        </TopBar>
    );
}

export default TopMenu;