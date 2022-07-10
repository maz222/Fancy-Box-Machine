import { SmartCursorTool } from './SmartCursorTool.js';
import {PointNode} from '../AppData/LayerPoints.js';
import ImageLayer from '../AppData/ImageLayer.js';
import { getRawImagePosition } from './UtilityFunctions.js';

import { AppSettings } from '../AppData/AppSettings.js';

export class PointTool extends SmartCursorTool {
    constructor() {
        super();
        this.id="point";
        this.cursor = "crosshair";
    }
    reset() {
        this.normalizedCursor = {x:0,y:0};
    }

    handleMouseMove(e, canvas, appContext) {
        super.handleMouseMove(e, canvas,appContext);
        //if(appContext.layerManager.layers.length > 0 && appContext.layerManager.layers[appContext.currentLayer].points.length > 0) {
        //}
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
    //Given a normalized point, check all the points in a layer to see if the normalized point overlaps. return the *index* of the found point within the layer
    checkForOverlap(position, layer, canvas, appContext) {
        const rawPos =  getRawImagePosition(position, canvas, appContext);
        const hitboxRadius = AppSettings.pointHitboxRadius;
        for(var p in layer.points) {
            const lp = getRawImagePosition(layer.points[p].position,canvas,appContext);
            const distSqrd = Math.sqrt(Math.pow((rawPos.x-lp.x),2) + Math.pow((rawPos.y-lp.y),2));
            if(distSqrd <= hitboxRadius) {
                return p;
            }
        }
        return null;
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e, canvas, appContext);
        if(appContext.layerManager.layers.length == 0) {
            this.addNewLayer(appContext, this.normalizedCursor);
            return true;
        }
        const currentLayer = appContext.layerManager.layers[appContext.currentLayer];
        const overlappedPointIndex = this.checkForOverlap(this.normalizedCursor,currentLayer, canvas, appContext);
        if(overlappedPointIndex !== null) {
            if(currentLayer.points.length - overlappedPointIndex > 2) {
                currentLayer.closePolygon(overlappedPointIndex);
                appContext.setLayerManager(appContext.layerManager.updateLayer(currentLayer.clone(),appContext.currentLayer));
                this.addNewLayer(appContext);
                return true;
            }
            return false;
        }
        const layerColor = currentLayer.color;
        const newPoint = new PointNode(this.normalizedCursor,layerColor);
        this.addPointToLayer(newPoint, appContext);
        return true;
    }
    checkPointsForRender(pointArray) {
        if(pointArray.length > 0) {
            const color = pointArray[pointArray.length-1].color;
            pointArray.push(new PointNode(this.normalizedCursor,color));
            pointArray[pointArray.length-2].setNextNode(pointArray[pointArray.length-1].position,color);
        }
        else {
            const white = [255,255,255];
            pointArray.push(new PointNode(this.normalizedCursor,white));
        }
        return pointArray;
    }
    render() {
        return;
    }
}