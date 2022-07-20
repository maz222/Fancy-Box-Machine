import BaseTool from "./Tools";
import { getNormalizedPosition } from "./UtilityFunctions";

export default class SelectTool extends BaseTool {
    constructor() {
        super();
        this.startCursor = null;
        this.selectedPointIndices = new Set();
    }
    handleMouseDown(e, canvas, appContext) {
        this.startCursor = getNormalizedPosition({x:e.pageX,y:e.pageY},canvas,appContext);
    }
    handleMouseUp(e, canvas, appContext) {
        const endCursor = getNormalizedPosition({x:e.pageX,y:e.pageY},canvas,appContext);
        const layerPoints = appContext.layerManager.layers[appContext.currentLayer].points;
        //top left corner of canvas is (0,0)
        const boxTop = Math.min(this.startCursor.y,endCursor.y);
        const boxBottom = Math.max(this.startCursor.y,endCursor.y);
        const boxLeft = Math.min(this.startCursor.x, endCursor.x);
        const boxRight = Math.max(this.startCursor,x, endCursor.x);
        this.selectedPointIndices = new Set();
        for(var i=0; i<layerPoints.length; i++) {
            const pointPos = layerPoints[i].position;
            if(pointPos.x >= boxLeft && pointPos.x <= boxRight) {
                if(pointPos.y >= boxTop && pointPos.y <= boxBottom) {
                    this.selectedPointIndices.add(i);
                }
            }
        }
        this.startCursor = null;
    }
}