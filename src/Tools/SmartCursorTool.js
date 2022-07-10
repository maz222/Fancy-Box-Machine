import BaseTool from "./Tools";

import { getNormalizedPosition, getRawPosition } from "./UtilityFunctions";

export class SmartCursorTool extends BaseTool {
    constructor() {
        super();
        this.normalizedCursor = {x:0,y:0};
    }
    //some kind of magic - gets the intersection point between two line segments, if it exists (null otherwise)
    //https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    getIntersection(l1,l2)
    {
        const p0 = l1[0];
        const p1 = l1[1];
        const p2 = l2[0];
        const p3 = l2[1];
        var s1 = {x:0,y:0};
        var s2 = {x:0,y:0};

        s1.x = p1.x - p0.x;     s1.y = p1.y - p0.y;
        s2.x = p3.x - p2.x;     s2.y = p3.y - p2.y;

        var s, t;
        s = (-s1.y * (p0.x - p2.x) + s1.x * (p0.y - p2.y)) / (-s2.x * s1.y + s1.x * s2.y);
        t = ( s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
        {
            return({x:p0.x +(t*s1.x),y:p0.y+(t*s1.y)});
        }
        return null; 
    }
    /*
        Gets an array of intersection points between a user defined line segment, and the various edges of the image

        userPoints - pair of *normalized* points relative to the image ([{x,y},{x,y}])
            0,0 = top left of image, 1,1 = bottom right of image
            first point is the most recently placed point, second point is the current position of the cursor
    */
    getBounded(userPoints) {
        //top, right, bottom, left line boundaries of the image (normalized)
        //0,0 = top left of image, 1,1 = bottom right of image
        const boundaries = [[{x:0,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:1}],[{x:1,y:1},{x:0,y:1}],[{x:0,y:1},{x:0,y:0}]];
        var intersectionPoints = [];
        for(var b in boundaries) {
            const intersectionPoint = this.getIntersection(userPoints,boundaries[b]);
            if(intersectionPoint !== null) {
                intersectionPoints.push(intersectionPoint);
            }
        }
        return null;
    }
    /*
        Clamps a given position to fit within the boundaries of the image

        position - the current, out of bounds, cursor position
        previousPointPosition - the position of the most recently placed point
    */
    clampPosition(position, previousPointPosition=null) {
        //If no points have been placed previously, clamp the point along the edge
        if(previousPointPosition === null) {
            return(this.simpleClamp(position));
        }
        //get a list of intersection points between the user line segment, and the edges of the image
        var points = this.getBounded([previousPointPosition, position]);
        var newPoint = null;
        //if a point has been found that *is not* the most recently placed point, use that point
        for(var p in points) {
            if(!this.comparePoints(points[p],previousPointPosition)) {
                newPoint = points[p];
            }
        }
        /*
            If the only point available is equal (same position) as the most recently placed point, 
            the user is trying to place a point along the same edge of the image as the edge the previous point was placed on.
            In this case, clamp the point based on how far along the edge the out-of-bounds cursor is, instead of being based on the intersection point
        */
        if(newPoint !== null) {
            return(newPoint);
        }
        else {
            return(this.simpleClamp(position));
        }
    }
    /*
        Clamps a point along the edge of the image based on how far along the edge the cursor is.
        As opposed to based on where the line segment between the cursor / previous point intersects the edge.
        Useful for when the user is trying to place their first point along the edge of the image, or create a straight line along the edge of the image
    */
    simpleClamp(position) {
        const x = Math.min(Math.max(0,position.x),1);
        const y = Math.min(Math.max(0,position.y),1);
        return {x:x,y:y}
    }
    //checks if two points are in the same position or not
    comparePoints(p1,p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }
    //takes the current cursor position, normalizes it, and potentially clamps it within the image. then updates the cursor position variable for this class
    updatePosition(e, canvas, appContext, clamped) {
        var t = getNormalizedPosition({x:e.pageX,y:e.pageY},canvas,appContext);
        const outOfBounds = t.x > 1 || t.x < 0 || t.y > 1 || t.y < 0;
        const currentLayer = appContext.currentLayer !== null ? appContext.layerManager.layers[appContext.currentLayer] : null;
        if(clamped && outOfBounds) {
            if(currentLayer !== null && currentLayer.points.length > 0) {
                const previousPointPosition = currentLayer.points[currentLayer.points.length-1].position;
                this.normalizedCursor = this.clampPosition(t, previousPointPosition);
                return;
            }
            else {
                this.normalizedCursor = this.simpleClamp(t);
                return;
            }
        }
        this.normalizedCursor = t;    
    }
    handleMouseDown(e, canvas, appContext, clamped=true) {
        this.updatePosition(e, canvas, appContext, clamped);
    }
    handleMouseMove(e, canvas, appContext, clamped=true) {
        this.updatePosition(e, canvas, appContext, clamped);
    }
}