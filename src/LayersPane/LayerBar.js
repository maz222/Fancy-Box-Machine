import React, {useContext, useEffect, useState} from 'react';
import styled from "styled-components";

//import {AppContext} from '../AppContextProvider.js';
import { AppContext } from '../AppData/AppContext';

import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import ImageLayer from '../AppData/ImageLayer';

const StyledLayer = styled.li`
    display:flex;
    width:calc(100% - 4px);
    padding:6px 2px 6px 2px;
    align-items:center;
    border: 1px solid rgba(0,0,0,0);
    color: rgb(200,200,200);

    .layerVisibility, .editLabel {
        display:flex;
        justify-content:center;
        align-items:center;
    }

    .layerColor, .layerVisibility, .editLabel, .polyIcon {
        width: 25px;
        height: 25px;
        margin: 0 5px 0 5px;
        background-color:rgba(0,0,0,0);
        border:0;
        color:rgb(200,200,200);
    }

    .polyIcon {
        display:flex;
        justify-content:center;
        align-items:center;
    }

    .layerVisibility:hover, .editLabel:hover {
        cursor:pointer;
    }

    .layerColor {
        border-radius:2px;
        margin-right: 10px;
    }

    .nameContainer {
        margin: 0;
        width:calc(100% - 35px * 3 - 5px);
    }

    .layerName {
        width:calc(100% - 10px);
        margin:0;
        text-overflow:ellipsis;
        overflow:hidden;
        white-space:nowrap;
    }

    .suggestedName {
        margin:0;
        font-size:.75em;
        color:grey;
        text-overflow:ellipsis;
        overflow:hidden;
        white-space:nowrap;
        width:100%;
    }

    :hover {
        background-color:rgb(40,40,40);
        border:1px solid black;
        color:white;
    }
`;

const InactiveLayer = styled(StyledLayer)`  
    .layerName {
        width:calc(100% - 35px * 2 - 5px);
    }
`;

const ActiveLayer = styled(StyledLayer)`
    background-color:rgb(20,20,20);
    border:1px solid black;
    color:#F5A80D;

    .layerColor, .layerVisibility, .editLabel, .polyIcon {
        color:#F5A80D;
    }

    :hover {
        color:#F5A80D;
    }
`

function Layer(props) {
    const appContext = useContext(AppContext);
    const nameRef = React.useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    //props
        //index - layer index used in appContext
        //appContext
    var layer = appContext.layerManager.layers[props.index];
    const visibility = layer.visibility;
    const color = "rgb(" + layer.color.join() + ")";
    const toggleVisibility = () => {
        layer.visibility = !layer.visibility;
        appContext.setLayerManager(appContext.layerManager.clone());
    };

    useEffect(() => {
        if(nameRef !== null && isFocused) {
            nameRef.current.focus();
        }
    },[isFocused]);

    useEffect(() => {
        setIsFocused(false);
    },[props.layer, appContext.currentLayer])

    const handleKey = (e) => {
        if(e.keyCode == 9 && props.suggestedName !== null) {
            e.preventDefault();
            props.nameCallback(props.suggestedName);
        }
    }

    return(
        props.index == appContext.currentLayer ? 
        <ActiveLayer>
            <button class="layerVisibility" onClick={toggleVisibility}>{visibility ? <i class="fas fa-eye"></i> : <i class="fas fa-eye-slash"></i>}</button>
            <div class="layerColor" style={{backgroundColor:color}}></div>
            <div className="nameContainer">
                {isFocused ? <input class="layerName" type="text" value={props.name} onKeyDown={handleKey} onChange={(e) => {props.nameCallback(e.target.value)}} disabled={!isFocused} ref={nameRef}/> 
                : <p className='layerName'>{props.name}</p>}
                {props.suggestedName !== null && isFocused ? <p className="suggestedName">{props.suggestedName}</p> : null}  
            </div>          
            {props.polygon ? <i class="fa-solid fa-draw-polygon polyIcon"></i> : null}       
            <button class="editLabel" onClick={() => {setIsFocused(true)}}><i class="fas fa-pen"></i></button>
        </ActiveLayer>
        :
        <InactiveLayer  onClick={() => {appContext.setCurrentLayer(props.index)}}>
            <button class="layerVisibility" onClick={toggleVisibility}>{visibility ? <i class="fas fa-eye"></i> : <i class="fas fa-eye-slash"></i>}</button>
            <div class="layerColor" style={{backgroundColor:color}}></div>
            <p className='layerName'>{props.name}</p>
            {props.polygon ? <i class="fa-solid fa-draw-polygon polyIcon"></i> : null}       
        </InactiveLayer>
    );
}

const StyledLayedPanel = styled.div`
    display:flex;
    flex-direction:column;
    align-items:center;
    background-color:rgb(40,40,40);
    border-radius:5px;
    padding:5px;
    width:300px;
    height:calc(100% - 50px);
    margin:20px;
    box-shadow:0px 0px 0px 1px rgba(255,255,255,.05) inset;

    #header {
        width:calc(100% - 40px);
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:10px 20px 10px 20px;
        border-bottom: 2px solid rgb(20,20,20);

        h2 {
            font-size:1.25em;
            color:rgb(200,200,200);
            margin:0;
        }
    }

    #layersContainer {
        margin: 5px 10px 5px 10px;
        overflow-y:scroll;
        flex-grow:1;
        width:calc(100% - 20px);
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    #layersContainer::-webkit-scrollbar {
        display:none;
    }
`;

const ButtonContainer = styled.div`
    display:grid;
    grid-template-columns: 1fr 1fr;
    grid-gap:5px;
    width:100%;
    margin: 10px 0 10px 0;
    padding-top:15px;
    border-top:2px solid rgb(20,20,20);

    button {
        flex-grow:1;
        background-color:rgba(0,0,0,0);
        border:2px solid rgba(0,0,0,0);
        color:rgb(200,200,200);
        border-radius:5px;
        padding: 10px;
    }
    
    button:hover {
        background-color:rgb(10,10,10);
        border:2px solid black;
        cursor:pointer;
        color:white;
    }
`;

function LayerBar() {
    const appContext = React.useContext(AppContext);
    const [newName, setNewName] = React.useState(null);
    const [suggestedName, setSuggestedName] = React.useState(null);
    const updateName = (text) => {
         setSuggestedName(appContext.labelTrie.suggestLabel(text));
         setNewName(text);
    }

    const [oldLayer, setOldLayer] = React.useState(appContext.currentLayer);
    React.useEffect(() => {
        if(newName !== null && newName.length > 0) {
            appContext.layerManager.layers[oldLayer].name = newName;
            appContext.setLayerManager(appContext.layerManager.clone());
        }
        setOldLayer(appContext.currentLayer);
        setNewName(null);
        setSuggestedName(null);
    },[appContext.currentLayer])

    const addLayer = () => {
        const newIndex = appContext.layerManager.layers.length;
        appContext.setLayerManager(appContext.layerManager.addLayer(new ImageLayer()));
        appContext.setCurrentLayer(newIndex);
    }

    const deleteLayer = (layerIndex) => {
        const newCurrLayer = appContext.layerManager.layers.length > 1 ? Math.max(0,appContext.currentLayer-1) : null;
        appContext.setLayerManager(appContext.layerManager.deleteLayer(layerIndex));
        appContext.setCurrentLayer(newCurrLayer);
    }

    const reorderLayers = (sourceIndex, destinationIndex) => {
        appContext.setLayerManager(appContext.layerManager.moveLayer(sourceIndex, destinationIndex));
        //if moving the current active layer, change currentLayer to the destination index - otherwise keep the same
        var newCurrentLayer = sourceIndex == appContext.currentLayer ? destinationIndex : appContext.currentLayer;
        //if moving the layer from above the current active layer to below it, decreate currentLayer by 1
        newCurrentLayer = sourceIndex < appContext.currentLayer && destinationIndex >= appContext.currentLayer ? appContext.currentLayer-1 : newCurrentLayer;
        //if moving the layer from below the current active layer to above it, increase currentLayer by 1
        newCurrentLayer = sourceIndex > appContext.currentLayer && destinationIndex <= appContext.currentLayer ? appContext.currentLayer+1 : newCurrentLayer;
        appContext.setCurrentLayer(newCurrentLayer);
    }

    return(
        <StyledLayedPanel>
            <div id="header">
                <h2>Layers</h2>
            </div>
            <div id="layersContainer">
                <DragDropContext onDragEnd={(result) => {
                        if(!result.destination) {return}
                        reorderLayers(result.source.index, result.destination.index);
                    }}
                    onDragStart = {() => {      
                        if(newName !== null && newName.length > 0) {
                            appContext.layerManager.layers[oldLayer].name = newName;
                            appContext.setLayerManager(appContext.layerManager.clone());
                        }
                        setNewName("");
                    }}
                >
                    <Droppable droppableId="layers">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                            {
                                appContext.layerManager.layers.map((item, index) => {
                                    const layer = appContext.layerManager.layers[index];
                                    return(
                                        <Draggable key={"layer" + index} draggableId={"layer" + index} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <Layer appContext={appContext} index={index} suggestedName={suggestedName} polygon={layer.polygon}
                                                    name={index == appContext.currentLayer ? (newName === null ? layer.name : newName) : layer.name} nameCallback={(text) => {updateName(text)}}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })
                            }
                            {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            <ButtonContainer>
                <button style={{flexGrow:1}} onClick={() => {addLayer()}}><i class="fas fa-plus"></i></button>
                <button style={{flexGrow:1}} onClick={() => {deleteLayer(appContext.currentLayer)}}><i class="fas fa-minus"></i></button>
            </ButtonContainer>
        </StyledLayedPanel>
    );
}

export default LayerBar;
