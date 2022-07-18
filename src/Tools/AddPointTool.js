import { SmartCursorTool } from './SmartCursorTool.js';
import {PointNode} from '../AppData/LayerPoints.js';
import ImageLayer from '../AppData/ImageLayer.js';
import { getRawImagePosition, getPointDistanceToLine, getNormalizedPosition } from './UtilityFunctions.js';

import { AppSettings } from '../AppData/AppSettings.js';

export class PointTool extends SmartCursorTool {
    constructor() {
        super();
        this.id="addPoint";
        this.cursor = "crosshair";
    }
    reset() {
        this.normalizedCursor = {x:0,y:0};
    }

    handleMouseMove(e, canvas, appContext) {
        super.handleMouseMove(e, canvas,appContext);
        return true;
    }
    handleMouseUp(e, canvas, appContext) {
        return false;
    }
    addNewLayer(appContext,normPosition=null) {
        if(normPosition !== null) {
            const newPoint = new PointNode(normPosition,[Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)]);
            var newLayer = new ImageLayer(true,newPoint.color,[newPoint]);
        }
        else {
            var newLayer = new ImageLayer(true,[Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)],[]);
        }
        appContext.setLayerManager(appContext.layerManager.addLayer(newLayer));
        appContext.setCurrentLayer(appContext.layerManager.layers.length-1);
    }
    addPointToLayer(newPoint, appContext) {
        var currLayer = appContext.layerManager.layers[appContext.currentLayer];
        currLayer.addPoint(newPoint);
        appContext.setLayerManager(appContext.layerManager.updateLayer(currLayer,appContext.currentLayer))
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e, canvas, appContext);
        if(appContext.layerManager.layers.length == 0) {
            this.addNewLayer(appContext, this.normalizedCursor);
            return true;
        }
        const currentLayer = appContext.layerManager.layers[appContext.currentLayer];
        const overlappedPointIndex = currentLayer.findEndpoint(this.normalizedCursor, canvas, appContext);
        if(overlappedPointIndex !== null) {
            if(currentLayer.points.length - overlappedPointIndex > 2) {
                console.log("on point intersection");
                currentLayer.closePolygon(overlappedPointIndex);
                appContext.setLayerManager(appContext.layerManager.updateLayer(currentLayer.clone(),appContext.currentLayer));
                this.addNewLayer(appContext);
                return true;
            }
            return false;
        }
        else {
            const lineIntersection = currentLayer.findPointOnLine(this.normalizedCursor, canvas, appContext);
            if(lineIntersection !== null && currentLayer.points.length-lineIntersection.prevPointIndex >= 2) {
                console.log("online intersection");
                const normalizedIntersection = getNormalizedPosition(lineIntersection.intersection,canvas,appContext);
                currentLayer.points[lineIntersection.prevPointIndex].position = normalizedIntersection;
                currentLayer.closePolygon(lineIntersection.prevPointIndex);
                //console.log(currentLayer.points);
                appContext.setLayerManager(appContext.layerManager.updateLayer(currentLayer.clone(),appContext.currentLayer));
                this.addNewLayer(appContext);
                return true;
            }
        }
        const layerColor = currentLayer.color;
        const newPoint = new PointNode(this.normalizedCursor,layerColor);
        this.addPointToLayer(newPoint, appContext);
        return true;
    }
    checkLayerForRender(layer) {
        if(layer.points.length > 0) {
            const color = layer.points[layer.points.length-1].color;
            layer.points.push(new PointNode(this.normalizedCursor,color));
            layer.points[layer.points.length-2].setNextNode(layer.points[layer.points.length-1].position,color);
        }
        else {
            const white = [255,255,255];
            layer.points.push(new PointNode(this.normalizedCursor,white));
        }
        return layer;
    }
    render() {
        return;
    }
}