import { SmartCursorTool } from './SmartCursorTool.js';
import {PointNode} from '../AppData/LayerPoints.js';
import ImageLayer from '../AppData/ImageLayer.js';
import { getRawImagePosition, getPointDistanceToLine, getNormalizedPosition } from './UtilityFunctions.js';

export class AddPointTool extends SmartCursorTool {
    constructor() {
        super();
        this.id="addPoint";
        this.cursor = "crosshair";
    }
    reset() {
        this.normalizedCursor = {x:0,y:0};
    }
    handleMouseMose(e, canvas, appContext) {
        super.handleMouseMove(e, canvas, appContext);
        return true;
    }
    handleMouseUp(e, canvas, appContext) {
        return false;
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e, canvas, appContext);
        if(appContext.layerManager.layers.length == 0) {
            return true;
        }
        const currentLayer = appContext.layerManager.layers[appContext.currentLayer];
        const newPointData = currentLayer.findPointOnLine(this.normalizedCursor, canvas, appContext);
        if(newPointData) {
            const normalizedIntersection = getNormalizedPosition(newPointData.intersection, canvas, appContext);
            if(normalizedIntersection.x !== this.normalizedCursor.x || normalizedIntersection.y !== this.normalizedCursor.y) {
                currentLayer.insertPoint(new PointNode(normalizedIntersection, currentLayer.color),newPointData.prevPointIndex+1);
                appContext.setLayerManager(appContext.layerManager.clone());
            }
        }
    }

}