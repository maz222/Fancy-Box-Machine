import { AppSettings } from "./AppSettings";

export class PointNode {
    /*
        ListNode subnode representing a single point placed on the canvas
        
        position: {x (float),y (float)} *normalized* (0-1) coord position within the canvas
        color: [(0-255),(0-255),(0-255)] rgb color value stored as an array
        radius: (int) the radius of the point
        glProgramKey: (string) key used to retrieve the approriate openGL program for rendering the point (in MainEditor.js) 

       lineTo: {point, color, width, shaders}
            -position: {x (float),y (float)} *normalized* (0-1) coord position within the canvas
            -color: [(0-255),(0-255),(0-255)] rgb color value stored as an array. color of the line connecting the points
            -width: the width of the line connecting the two points
            -glProgramKey: (string) key used to retrieve the approriate openGL program for rendering the line (in MainEditor.js) 
    */
    constructor(position,color,radius=AppSettings.pointRadius,glProgramKey="point") {
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.glProgramKey = glProgramKey;

        this.lineTo = null;
    }
    setNextNode(pointPosition,lineColor=this.color,lineWidth=AppSettings.lineWidth,glProgramKey="line") {
        if(pointPosition === null) {
            this.lineTo = null;
        }
        else {
            this.lineTo = {
                position:pointPosition,
                color:lineColor,
                width:lineWidth,
                glProgramKey:glProgramKey
            }
        }
    }
    clone() {
        var clonedPoint = new PointNode(this.position, this.color, this.radius, this.glProgramKey);
        if(this.lineTo !== null) {
            clonedPoint.setNextNode(this.lineTo.position, this.lineTo.color, this.lineTo.width, this.lineTo.glProgramKey);
        }
        return clonedPoint;
    }
}