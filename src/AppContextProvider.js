import React from 'react';

import Tool from './Tools/Tools.js';

export const AppContext = React.createContext();

//Layer
//{visibility:(bool), points:[[0.0,1.0],[0.5,0.0],...], color:[255,255,255]}
//visibility - whether the layer is rendered or not
//points - array of user place points with a 0 - 1 coordinate system relative to the image dimentions (0 = 0%, 1 = 100%)
//color - color of the rendered lines for the layer

class AppContextProvider extends React.Component {
    constructor(props) {
        super(props);
            this.state = {
            zoomOffset:[0,0],
            zoom:1,
            contrast:1,
            brightness:1,
            layers:[],
            currentLayer:null,
            currentTool:new Tool(this),
            currentFrame:null,
            canvasSize:null,
        }
        console.log("new provider?");
    }

    render() {
        return (
        <AppContext.Provider 
            value = {{
                zoomOffset:this.state.zoomOffset,
                setZoomOffset:(newOffset) => {
                    console.log(newOffset); 
                    this.setState({zoomOffset:newOffset}, () => {
                        this.state.currentTool.updateContextData(this.state);
                    });
                },
                addZoomOffset:(newOffset) => {
                    console.log(newOffset);
                    this.setState((prevState,props) => {
                        return {zoomOffset:[prevState.zoomOffset[0] + newOffset[0], prevState.zoomOffset[1] + newOffset[1]]};
                    }, () => {
                        this.state.currentTool.updateContextData(this.state);
                    });
                },

                zoom:this.state.zoom,
                setZoom:(newZoom) => {
                    console.log(newZoom); 
                    this.setState({zoom:newZoom}, () => {
                        this.state.currentTool.updateContextData(this.state);
                    });
                },
                addZoom:(newZoom) => {
                    console.log(newZoom);
                    this.setState((prevState,props) => {
                        console.log(prevState.zoom + newZoom);
                        return {zoom:prevState.zoom + newZoom};
                    }, () => {
                        this.state.currentTool.updateContextData(this.state);
                    });
                },

                contrast:this.state.contrast,
                setContrast:(newContrast) => {console.log(newContrast); this.setState({contrast:newContrast})},
                addContrast:(newContrast) => {
                    console.log(newContrast);
                    this.setState((prevState, props) => {
                        console.log(prevState.contrast + newContrast);
                        return {contrast:prevState.contrast + newContrast};
                    })
                },

                brightness:this.state.brightness,
                setBrightness:(newBrightness) => {console.log(newBrightness); this.setState({brightness:newBrightness})},
                addBrightness:(newBrightness) => {
                    console.log(newBrightness);
                    this.setState((prevState, props) => {
                        console.log(prevState.brightness + newBrightness);
                        return {brightness:prevState.brightness + newBrightness};
                    });
                },

                layers:this.state.layers,
                addLayer:(newLayer) => {
                    this.setState((prevState, props) => {
                        return({layers:[...prevState.layers, newLayer], currentLayer:prevState.layers.length});
                    });
                },
                deleteLayer:(layerIndex) => {
                    this.setState((prevState, props) => {
                        var newLayers = [...prevState.layers];
                        newLayers.splice(layerIndex, 1);
                        return({currentLayer:Math.max(0,layerIndex-1), layers:newLayers});
                    })
                },
                replaceLayer:(newLayer,layerIndex) => {
                    this.setState((prevState, props) => {
                        var newLayers = [...prevState.layers];
                        newLayers.splice(layerIndex,1,newLayer);
                        return({layers:newLayers});
                    });
                },
                //startIndex - the original index of the layer
                //endIndex - the index the laryer is moved to
                reorderLayer:(startIndex,endIndex) => {
                    this.setState((prevState,props) => {
                        var newLayers = [...prevState.layers];
                        var movedLayer = newLayers.splice(startIndex,1);
                        newLayers.splice(endIndex,0,movedLayer[0]);
                        //if moving the current active layer, change currentLayer to the destination index - otherwise keep the same
                        var newCurrentLayer = startIndex == prevState.currentLayer ? endIndex : prevState.currentLayer;
                        //if moving the layer from above the current active layer to below it, decreate currentLayer by 1
                        newCurrentLayer = startIndex < prevState.currentLayer && endIndex >= prevState.currentLayer ? prevState.currentLayer-1 : newCurrentLayer;
                        //if moving the layer from below the current active layer to above it, increase currentLayer by 1
                        newCurrentLayer = startIndex > prevState.currentLayer && endIndex <= prevState.currentLayer ? prevState.currentLayer+1 : newCurrentLayer;
                        return({layers:newLayers, currentLayer:newCurrentLayer});
                    })
                },
                addPointToLayer:(point) => {
                    if(this.state.currentLayer == null || this.state.layers.length == 0) {
                        return;
                    }
                    this.setState((prevState, props) => {
                        var layersDupp = [...this.state.layers];
                        var currentLayerDupp = {...layersDupp[this.state.currentLayer]};
                        var pointsDupp = [...currentLayerDupp.points];
                        pointsDupp.push(point);
                        if(pointsDupp.length > 1) {
                            pointsDupp[pointsDupp.length-2].setNextNode(point,point.color);
                        }
                        currentLayerDupp.points = pointsDupp;
                        layersDupp[this.state.currentLayer] = currentLayerDupp;
                        return({layers:layersDupp});
                    })
                },

                currentLayer:this.state.currentLayer,
                setCurrentLayer:(layerIndex) => {this.setState({currentLayer:layerIndex})},

                currentTool:this.state.currentTool,
                setCurrentTool:(newTool) => {console.log(newTool); this.setState({currentTool:newTool})},

                currentFrame:this.state.currentFrame,
                setFrame:(newFrame) => {this.setState({currentFrame:newFrame}, () => {
                    this.state.currentTool.updateContextData(this.state);
                })},

                canvasSize:this.state.canvasSize,
                setCanvasSize:(newSize) => {console.log(newSize);this.setState({canvasSize:newSize}, () => {
                    this.state.currentTool.updateContextData(this.state);
                })}
            }
        }>
            {this.props.children}
        </AppContext.Provider>
        )
    }
}

export default AppContextProvider;