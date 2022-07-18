import BaseTool from './Tools.js';
import { getNormalizedPosition } from './UtilityFunctions.js';

export default class DeletePointTool extends BaseTool {
    constructor() {
        super();
        this.id = "deletePoint";
        this.cursor = "crosshair";
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e, canvas);
        const normalizedClick = getNormalizedPosition({x:e.pageX,y:e.pageY},canvas,appContext);
        const currentLayer = appContext.layerManager.layers[appContext.currentLayer];
        const overlappedPointIndex = currentLayer.findEndpoint(normalizedClick, canvas, appContext);
        if(overlappedPointIndex !== null) {
            currentLayer.deletePoint(overlappedPointIndex);
            appContext.setLayerManager(appContext.layerManager.updateLayer(currentLayer.clone(),appContext.currentLayer));
            return true;
        }
        return false;
    }
}