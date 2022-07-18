import { SmartCursorTool } from "./SmartCursorTool";

export default class MovePointTool extends SmartCursorTool {
    constructor() {
        super();
        this.id="movePoint";
        this.cursor = "crosshair";
        this.currentPointIndex = null;
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e,canvas,appContext);
        const currentLayer = appContext.layerManager.layers[appContext.currentLayer];
        var pointIndex = currentLayer.findEndpoint(this.normalizedCursor, canvas, appContext);
        if(pointIndex !== null) {
            this.currentPointIndex = pointIndex;
            return true;
        }
        return false;
    }
    handleMouseMove(e, canvas, appContext) {
        super.handleMouseMove(e, canvas, appContext);
        if(this.currentPointIndex !== null) {
            return true;
        }
        return false;
    }
    handleMouseUp(e, canvas, appContext) {
        super.handleMouseUp(e,canvas,appContext);
        if(this.currentPointIndex !== null) {
            const currentLayer = appContext.layerManager.layers[appContext.currentLayer];
            console.log(this.currentPointIndex);
            console.log(currentLayer.polygon);
            currentLayer.movePoint(this.currentPointIndex, this.normalizedCursor);
            appContext.setLayerManager(appContext.layerManager.updateLayer(currentLayer.clone(),appContext.currentLayer));
        }
        this.currentPointIndex = null;
        return true;
    }
    checkLayerForRender(layer) {
        if(this.currentPointIndex !== null) {
            layer.movePoint(this.currentPointIndex, this.normalizedCursor);
            //pointArray[this.currentPointIndex].position = this.normalizedCursor;
            //if(this.currentPointIndex > 0) {
            //    pointArray[this.currentPointIndex-1].setNextNode(pointArray[this.currentPointIndex].position);
           //}
        }
        return layer;
    }
}