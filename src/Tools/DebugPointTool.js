import { SmartCursorTool } from "./SmartCursorTool";
import { getRawImagePosition } from "./UtilityFunctions";
import { AppSettings } from "../AppData/AppSettings";

export class DebugPositionTool extends SmartCursorTool {
    constructor() {
        super();
        this.id="debugTool";
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
    handleMouseDown(e, canvas, appContext, clamped=true) {
        this.updatePosition(e, canvas, appContext, clamped);
        console.log(appContext.layerManager.layers);
        var debugStrings = [];
        debugStrings.push("------");
        debugStrings.push(`Event Position: [${e.pageX},${e.pageY}]`);
        debugStrings.push(`Normalized Position: [${this.normalizedCursor.x},${this.normalizedCursor.y}]`);
        const rawPos = getRawImagePosition(this.normalizedCursor,canvas,appContext);
        debugStrings.push(`Raw From Normalized: [${rawPos.x},${rawPos.y}]`);
        debugStrings.push("------");
        const currLayer = appContext.layerManager.layers[appContext.currentLayer];
        if(!currLayer || currLayer.points.length === 0) {
            console.log(debugStrings);
            appContext.setDebugText(debugStrings);
            return;
        }
        const pointIndex = this.checkForOverlap(this.normalizedCursor, currLayer, canvas, appContext);
        if(pointIndex !== null) {
            const point = appContext.layerManager.layers[appContext.currentLayer].points[pointIndex];
            debugStrings.push(`Point Index: ${pointIndex}`);
            debugStrings.push(`Point Position: [${point.position.x},${point.position.y}]`);
            const pointRaw = getRawImagePosition(point.position, canvas, appContext);
            debugStrings.push(`Point Raw: [${pointRaw.x},${pointRaw.y}]`);
            if(point.lineTo !== null) {
                debugStrings.push(`LineTo: [${point.lineTo.position.x},${point.lineTo.position.y}]`);
                const lineToRaw = getRawImagePosition(point.lineTo.position, canvas, appContext);
                debugStrings.push(`LineTo Raw: [${lineToRaw.x},${lineToRaw.y}]`);
            }        
            debugStrings.push("------");
        }
        console.log(debugStrings);
        appContext.setDebugText(debugStrings);
    }
}