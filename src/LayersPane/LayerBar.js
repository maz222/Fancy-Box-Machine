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
    border-bottom:1px solid black;

    .layerVisibility, .editLabel {
        display:flex;
        justify-content:center;
        align-items:center;
    }

    .layerColor, .layerVisibility, .editLabel {
        width: 25px;
        height: 25px;
        margin: 0 5px 0 5px;
    }

    .layerName {
        margin: 0 0 0 5px;
        width:calc(100% - 35px * 3 - 5px);
        text-overflow:ellipsis;
    }
`;

const InactiveLayer = styled(StyledLayer)`  
    background-color:rgb(100,100,100);

    .layerName {
        width:calc(100% - 35px * 2 - 5px);
    }
`;

const ActiveLayer = styled(StyledLayer)`
    background-color:white;
`

function Layer(props) {
    const appContext = useContext(AppContext);
    const nameRef = React.useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [newLabel, setNewLabel] = useState(appContext.layerManager.layers[props.index].name);
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
        console.log("layer name change");
        setNewLabel(appContext.layerManager.layers[props.index].name);
    },[appContext.layerManager.layers[props.index].name])

    useEffect(() => {
        console.log("curr layer change");
        if(newLabel.length > 0 ) {
            updateLayerName(newLabel)
        }
    },[appContext.currentLayer])

    useEffect(() => {
        console.log(`index change: ${props.index}`);
    },[props.index]);

    const updateLayerName = (newName) => {
        var layer = appContext.layerManager.layers[props.index];
        if(layer.name != newName) {
            layer.name = newName;
            appContext.layerManager.updateLayer(layer,props.index);
        }
    }

    return(
        props.index == appContext.currentLayer ? 
        <ActiveLayer>
            <button class="layerVisibility" onClick={toggleVisibility}>{visibility ? <i class="fas fa-eye"></i> : <i class="fas fa-eye-slash"></i>}</button>
            <div class="layerColor" style={{backgroundColor:color}}></div>
            {isFocused ? <input class="layerName" type="text" value={newLabel.length > 0 ? newLabel : layer.name} 
                onChange={(e) => {setNewLabel(e.target.value)}} disabled={!isFocused} onSubmit={(e) => {updateLayerName(e.target.value)}} ref={nameRef}/> : <p className='layerName'>{layer.name}</p>}
            
            <button class="editLabel" onClick={() => {setIsFocused(true)}}><i class="fas fa-pen"></i></button>
        </ActiveLayer>
        :
        <InactiveLayer  onClick={() => {appContext.setCurrentLayer(props.index)}}>
            <button class="layerVisibility" onClick={toggleVisibility}>{visibility ? <i class="fas fa-eye"></i> : <i class="fas fa-eye-slash"></i>}</button>
            <div class="layerColor" style={{backgroundColor:color}}></div>
            <p className='layerName'>{newLabel}</p>        
        </InactiveLayer>
    );
}

const StyledLayedPanel = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:space-between;
    align-items:center;
    background-color:grey;
    padding:5px;
    width:200px;
    height:calc(100% - 10px);
`;

const ButtonContainer = styled.div`
    display:grid;
    grid-template-columns: 1fr 1fr;
    grid-gap:5px;
    width:100%;
    height:30px;
    margin: 10px 0 10px 0;
`;

function LayerBar() {
    const appContext = React.useContext(AppContext);

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
            <div style={{width:'100%'}}>
                <h2>Layers</h2>
                <DragDropContext onDragEnd={(result) => {
                    if(!result.destination) {return}
                    reorderLayers(result.source.index, result.destination.index)
                }}>
                    <Droppable droppableId="layers">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                            {
                                appContext.layerManager.layers.map((item, index) => {
                                    return(
                                        <Draggable key={"layer" + index} draggableId={"layer" + index} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <Layer appContext={appContext} index={index}/>
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
