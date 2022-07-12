import { SmartCursorTool } from "./SmartCursorTool";
import { getRawImagePosition } from "./UtilityFunctions";
import { AppSettings } from "../AppData/AppSettings";

export class DebugPositionTool extends SmartCursorTool {
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
        console.log("------");
        console.log(`Event Position: [${e.pageX},${e.pageY}]`);
        console.log(`Normalized Position: [${this.normalizedCursor.x},${this.normalizedCursor.y}]`)
        const rawPos = getRawImagePosition(this.normalizedCursor,canvas,appContext);
        console.log(`Raw From Normalized: [${rawPos.x},${rawPos.y}]`);
        console.log("------");
        const currLayer = appContext.layerManager.layers[appContext.currentLayer];
        const pointIndex = this.checkForOverlap(this.normalizedCursor, currLayer, canvas, appContext);
        if(pointIndex !== null) {
            const point = appContext.layerManager.layers[appContext.currentLayer].points[pointIndex];
            console.log(`Point Count: ${currLayer.points.length}`);
            console.log(`Point Position: [${point.position.x},${point.position.y}]`);
            const pointRaw = getRawImagePosition(point.position, canvas, appContext);
            console.log(`Point Raw: [${pointRaw.x},${pointRaw.y}]`);
            if(point.lineTo !== null) {
                console.log(`LineTo: [${point.lineTo.position.x},${point.lineTo.position.y}]`);
                const lineToRaw = getRawImagePosition(point.lineTo.position, canvas, appContext);
                console.log(`LineTo Raw: [${lineToRaw.x},${lineToRaw.y}]`);
            }        
            console.log("------");
        }
    }
}