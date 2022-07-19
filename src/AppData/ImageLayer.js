import { getRawImagePosition, getPointDistanceToLine, getNormalizedPosition } from '../Tools/UtilityFunctions.js';
import { AppSettings } from './AppSettings.js';

const getRandomColor = () => {
    return([
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
    ]);
}

export class LayerManager {
    constructor(layers=[]) {
        this.layers = layers;
    }
    addLayer(newLayer,clone=true) {
        this.layers.push(newLayer);
        if(clone){return this.clone();}
    }
    deleteLayer(layerIndex,clone=true) {
        this.layers.splice(layerIndex,1);
        if(clone){return this.clone();}
    }
    updateLayer(newLayer, layerIndex, clone=true) {
        this.layers.splice(layerIndex,1,newLayer);
        if(clone){return this.clone();}
    }
    moveLayer(startIndex, endIndex, clone=true) {
        const targetLayer = this.layers.splice(startIndex,1);
        this.layers.splice(endIndex,0,targetLayer[0]);
        if(clone){return this.clone();}
    }
    clone() {
        var clonedLayers = [];
        for(var i in this.layers) {
            clonedLayers.push(this.layers[i].clone());
        }
        return new LayerManager(clonedLayers);
    }
}

export class ImageLayer {
    constructor(visibility=true,color=getRandomColor(),points=[],polygon=false,name="New Layer"){
        this.visibility = visibility;
        this.color = color;
        this.points = points;
        this.polygon = polygon;
        this.name = name;
    }
    addPoint(newPoint) {
        this.points.push(newPoint);
        if(this.points.length > 1) {
            this.points[this.points.length-2].setNextNode(newPoint.position,newPoint.color);
        }
    }
    /*
        Finds the closest end point of a line (within a certain radius) to a given position. X------X (Either X point)
        Returns either the *index of the point* or null (no point found)
            
        position - normalized position (0-1), {x:(float),y:(float)} relative to the image
    */
    findEndpoint(position,canvas,appContext) {
        const rawPos =  getRawImagePosition(position, canvas, appContext);
        const hitboxRadius = AppSettings.pointHitboxRadius;
        for(var i=0; i<this.points.length; i++) {
            const lp = getRawImagePosition(this.points[i].position,canvas,appContext);
            const distSqrd = Math.sqrt(Math.pow((rawPos.x-lp.x),2) + Math.pow((rawPos.y-lp.y),2));
            if(distSqrd <= hitboxRadius) {
                return i;
            }
        }
        return null;
    }
    /*
        Given a position, finds the closest point *along a line* (within a certain radius).
        Returns the position of the point along the line, as well as the starting point of the line (X---------X----------*) [returns both X's], or null
            returns : {intersection:{x:(int, *raw pixel* value),y:(int, *raw pixel* value)},prevPointIndex:(int, the index of the starting point of the line)}
            
        position - normalized position (0-1), {x:(float),y:(float)} relative to the image
    */
    findPointOnLine(position, canvas, appContext) {
        //console.log("----");
        const rawPointPos =  getRawImagePosition(position,canvas,appContext);
        for(var i=0; i<this.points.length-1; i++) {
            const rawLinePos1 = getRawImagePosition(this.points[i].position,canvas,appContext);
            const rawLinePos2 = getRawImagePosition(this.points[i+1].position,canvas,appContext);
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
            }
        }
        return null;
    }
    deletePoint(pointIndex) {
        //set the previous point to connect with the next point
        if(pointIndex-1 >= 0 && pointIndex+1 < this.points.length) {
            this.points[pointIndex-1].setNextNode(this.points[pointIndex+1].position);
        }
        //if the last point was deleted, the previous point shouldn't point to anything
        if(pointIndex+1 == this.points.length) {
            this.points[pointIndex-1].setNextNode(null);
        }
        //if deleting the 'hinge' point of a polygon (N---*0*---1), need to change the last point of the polygon as well
        //technically, polygons can't be less than two points
        if(pointIndex == 0 && this.polygon) {
            this.points[this.points.length-1].setNextNode(this.points[1].position);
        }
        this.points.splice(pointIndex,1);
        //if there are 2 or less points, the points can't form a polygon / be complete
        if(this.points.length <= 2 && this.points.length > 0) {
            this.points[this.points.length-1].setNextNode(null);
            this.polygon = false;
        }
    }
    movePoint(pointIndex,newPosition) {
        this.points[pointIndex].position = newPosition;
        if(pointIndex > 0) {
            this.points[pointIndex-1].setNextNode(newPosition);
        }
        if(this.polygon && pointIndex == 0) {
            console.log("poly point?");
            this.points[this.points.length-1].setNextNode(newPosition);
        }
    }
    closePolygon(startingPointIndex) {
        this.points.splice(0,startingPointIndex);
        this.points[this.points.length-1].setNextNode(this.points[0].position,this.points[0].color);
        this.polygon = true;
    }
    clone() {
        var clonedPoints = [];
        for(var i in this.points) {
            clonedPoints.push(this.points[i].clone());
        }
        return new ImageLayer(this.visibility,[...this.color],clonedPoints,this.polygon,this.name);
    }
}

export default ImageLayer;