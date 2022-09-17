import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";

//import {AppContext} from '../AppContextProvider.js';
import { AppContext } from '../AppData/AppContext';

import ExportPane from './ExportCanvas';

import {exportData} from './ExportUtilities.js';


const Container = styled.div`
    display:flex;
    justify-content:center;
    align-items:center;
    background-color: rgba(0,0,0,.5);
    position:absolute;
    width:100%;
    height:100%;
    backdrop-filter: blur(2px);
    z-index:900;
`;

const MenuPane = styled.div`
    background-color:rgb(40,40,40);
    padding:20px;
    border-radius:5px;
    box-shadow:0px 0px 0px 1px rgba(255,255,255,.05) inset;
    width:50%;
    height:40%;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
`;

const MenuHeader = styled.div`
    display:flex;
    flex-direction:column;
    border-bottom: 2px solid rgb(20,20,20);
    padding-bottom:20px;
    color:rgb(200,200,200);

    div {
        display:flex;
        justify-content:space-between;
        align-items:center;
    }

    button {
        background-color:rgba(0,0,0,0);
        border:2px solid rgba(0,0,0,0);
        font-size:1.5em;
        color:rgb(200,200,200);
        margin:0;
        padding:5px
    }

    button:hover {
        background-color:rgb(10,10,10);
        border:2px solid black;
        border-radius:5px;
        color:white;
        cursor:pointer;
    }

    h2 {
        margin:0;
    }

    p {
        margin: 0;
    }
    .red {
        color:#B0031A;
    }
    .green {
        color:#00B025
    }
`;

const MenuBody = styled.div`
    display:flex;
    flex-grow:1;
    justify-content:center;
    #optionsGrid {
        display: grid;
        grid-template-columns:1fr 1fr;
        grid-template-rows:1fr;
        width:80%;
        height:100%
    }
    .optionCell {
        display:flex;
        align-items:center;
        color:white;
        font-size:1.25em;
        font-weight:normal;
    }
`;

const MenuBottom = styled.div`
    border-top: 2px solid rgb(20,20,20);
    padding-top: 20px;

    button {
        background-color:rgba(0,0,0,0);
        border:2px solid rgba(0,0,0,0);
        font-size:1.5em;
        color:rgb(200,200,200);
        margin:0;
        padding:5px
    }

    button:hover {
        background-color:rgb(10,10,10);
        border:2px solid black;
        border-radius:5px;
        color:white;
        cursor:pointer;
    }
`;

const CheckboxContainer = styled.div`
    display:flex;
    align-items:center;

    h5:hover {
        cursor:pointer;
    }
`;

const StyledCheckbox = styled.div`
    width:.75em;
    height:.75em;
    padding:10px;
    background-color:rgba(0,0,0,.1);
    border:2px solid rgba(0,0,0,.4);
    display:flex;
    justify-content:center;
    align-items:center;
    border-radius: 5px;
    margin-right:10px;

    i {
        color:rgb(240,240,240);

    }

    :hover {
        cursor:pointer;
        background-color:rgb(10,10,10);
        border:2px solid black;
        i {
            color:white;
        }
    }
`;

function CustomCheckbox(props) {
    return(
        <CheckboxContainer>
            <StyledCheckbox onClick={(e) => {props.callback(!props.checked)}}>{props.checked ? <i class="fa-solid fa-check" /> : null}</StyledCheckbox>
            <h5 onClick={(e) => {props.callback(!props.checked)}}>{props.labelText}</h5>
       </CheckboxContainer>
    );
}

export default function ExportMenu(props) {
    const appContext = useContext(AppContext);

    const [cropImages,setCropImages] = useState(true);
    const [omitOverlap, setOmitOverlap] = useState(true);
    const [imageBlobs, setImageBlobs] = useState([]);

    var numCompletedLayers = 0;
    appContext.layerManager.layers.forEach((layer,index) => {
        if(layer.polygon) {
            numCompletedLayers++;
        }
    });
    const incompleteLayers = appContext.layerManager.layers.length - numCompletedLayers;

    useEffect(() => {
        console.log(imageBlobs);
    },[imageBlobs])

    return(
        <Container>
            <ExportPane exportImagesCallback={setImageBlobs}/>
            <MenuPane>
                <MenuHeader>
                    <div>
                        <h2>Export Layers</h2>
                        <button  onClick={(e) => {appContext.setExporting(false)}}><i class="fa-regular fa-circle-xmark"></i></button>
                    </div>
                    {incompleteLayers > 0 ? <p className="red">{incompleteLayers} incomplete layer(s)!</p> : <p className="green">{numCompletedLayers} layer(s)</p>}
                </MenuHeader>
                <MenuBody>
                    <div id="optionsGrid">
                        <div className="optionCell">
                            <CustomCheckbox checked={cropImages} callback={setCropImages} labelText={"Crop images to polygons"}/>
                        </div>
                        <div className="optionCell">
                            <CustomCheckbox checked={omitOverlap} callback={setOmitOverlap} labelText={"Omit layer overlap"}/>
                        </div>
                    </div>
                </MenuBody>
                <MenuBottom>
                    <button onClick={(e) => {exportData(appContext.layerManager.layers, imageBlobs)}}><i class="fa-solid fa-download"></i></button>
                </MenuBottom>
            </MenuPane>
        </Container>
    );
}