import { SmartCursorTool } from './SmartCursorTool.js';
import {PointNode} from '../AppData/LayerPoints.js';
import ImageLayer from '../AppData/ImageLayer.js';
import { getRawImagePosition, getPointDistanceToLine, getNormalizedPosition } from './UtilityFunctions.js';

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
    //optimize by checking if point is within rectangle hitbox created by two line points - avoid distance formula
    checkForOnLine(position, layer, canvas, appContext) {
        //console.log("----");
        const rawPointPos =  getRawImagePosition(position,canvas,appContext);
        for(var i=0; i<layer.points.length-1; i++) {
            const rawLinePos1 = getRawImagePosition(layer.points[i].position,canvas,appContext);
            const rawLinePos2 = getRawImagePosition(layer.points[i+1].position,canvas,appContext);
            //distance between the point and the layer line - a
            var lineDistance = getPointDistanceToLine(rawPointPos,[rawLinePos1,rawLinePos2]);
            if(lineDistance <= AppSettings.lineHitboxRadius) {
                //distance between the point and one of the line points - c (hypotenuse)
                const pointDistance = Math.sqrt(Math.pow(rawPointPos.x-rawLinePos1.x,2)+Math.pow(rawPointPos.y-rawLinePos1.y,2));
                //b = sqrt(c^2 - a^2), distance moved down the line to reach the intersection point
                const lineTravel = Math.sqrt(Math.pow(pointDistance,2) - Math.pow(lineDistance,2));
                const normalizedLineVector = [rawLinePos2.x-rawLinePos1.x,rawLinePos2.y-rawLinePos1.y];
                const vecMagnitude = Math.sqrt(Math.pow(normalizedLineVector[0],2) + Math.pow(normalizedLineVector[1],2));
                const unitVector = [normalizedLineVector[0]/vecMagnitude, normalizedLineVector[1]/vecMagnitude];
                const intersectionPoint = {x:Math.floor(rawLinePos1.x+unitVector[0]*lineTravel), y:Math.floor(rawLinePos1.y+unitVector[1]*lineTravel)};
                //console.log(intersectionPoint);
                if(intersectionPoint.x >= Math.min(rawLinePos1.x,rawLinePos2.x) && intersectionPoint.x <= Math.max(rawLinePos1.x,rawLinePos2.x)) {
                    if(intersectionPoint.y >= Math.min(rawLinePos1.y,rawLinePos2.y) && intersectionPoint.y <= Math.max(rawLinePos1.y,rawLinePos2.y)) {
                        //console.log(`Raw Cursor: [${rawPointPos.x},${rawPointPos.y}]`)
                        //console.log(`Line Start: [${rawLinePos1.x},${rawLinePos1.y}], Line End: [${rawLinePos2.x},${rawLinePos2.y}] Intersection: [${intersectionPoint.x},${intersectionPoint.y}]` );
                        //console.log(`Unit Vector: [${1/unitVector[0]},${1/unitVector[1]}]`);
                        return {intersection:intersectionPoint,prevPointIndex:i};
                    }
                }
                //return getNormalizedPosition(intersectionPoint,canvas,appContext);
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
                console.log("on point intersection");
                currentLayer.closePolygon(overlappedPointIndex);
                appContext.setLayerManager(appContext.layerManager.updateLayer(currentLayer.clone(),appContext.currentLayer));
                this.addNewLayer(appContext);
                return true;
            }
            return false;
        }
        else {
            const lineIntersection = this.checkForOnLine(this.normalizedCursor, currentLayer, canvas, appContext);
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