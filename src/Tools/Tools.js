export class BaseTool {
    constructor() {
        this.id = "default";
        this.cursor = "default";
    }
    reset() {
        return;
    }
    handleMouseDown(e, canvas, appContext) {
        //console.log("Mouse down at: " + e.pageX + ", " + e.pageY);
        //const rect = canvas.getBoundingClientRect();
        //console.log("In canvas at: " + String(e.pageX-rect.left) + ", " + String(e.pageY-rect.top));
        return false;
    }
    handleMouseUp(e, canvas, appContext) {
        //console.log("Mouse up at: " + e.pageX + ", " + e.pageY);
        //const rect = canvas.getBoundingClientRect();
        //console.log("In canvas at: " + String(e.pageX-rect.left) + ", " + String(e.pageY-rect.top));
        return false;
    }
    handleMouseMove(e, canvas, appContext) {
        return false;
    }
    checkPointsForRender(pointArray) {
        return pointArray;
    }
}

export class ZoomTool extends BaseTool {
    constructor(zoomAmount) {
        super();
        this.id = "zoom";
        this.zoomAmount = zoomAmount;
        this.cursor = this.zoomAmount > 0 ? "zoom-in" : "zoom-out";
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e, canvas, appContext);
        //assume that canvas element is centered on the page!!!
        //this.appContext.setZoomOffset([window.innerWidth/2 - e.pageX, e.pageY - window.innerHeight/2]);
        var zoomCopy =  {...appContext.zoom};
        zoomCopy.amount = zoomCopy.amount + this.zoomAmount;
        appContext.setZoom(zoomCopy);
        //doesn't properly account for moving around after previous zooming in!!!
        //const offset = [e.pageX / this.appContext.canvasSize[0], e.pageY / this.appContext.canvasSize[1]];
        //this.appContext.addZoomOffset(offset);
        return true;
    }
}

export class MoveTool extends BaseTool {
    constructor() {
        super();
        this.id="move";
        this.startLocation = null;
        this.lastLocation = null;
        this.cursor = "grab";
    }
    reset() {
        this.startLocation = null;
        this.lastLocation = null;
    }
    handleMouseDown(e, canvas, appContext) {
        super.handleMouseDown(e, canvas);
        this.startLocation = [e.pageX, e.pageY];
        this.lastLocation = [e.pageX, e.pageY];
        return false;
    }
    handleMouseMove(e, canvas, appContext) {
        super.handleMouseMove(e, canvas);
        if(this.startLocation == null || this.lastLocation == null) {
            return
        }
        //doesn't properly account for moving around after previous zooming in!!!
        var zoomCopy = {...appContext.zoom};
        zoomCopy.offset = [zoomCopy.offset[0]+e.pageX-this.lastLocation[0], zoomCopy.offset[1]+this.lastLocation[1]-e.pageY];
        appContext.setZoom(zoomCopy);
        this.lastLocation = [e.pageX, e.pageY];
        return true;
    }
    handleMouseUp(e, canvas, appContext) {
        super.handleMouseUp(e, canvas, appContext);
        this.startLocation = null;
        this.lastLocation = null;
        return false;
    }
}

export default BaseTool;