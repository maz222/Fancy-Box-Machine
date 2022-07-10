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
    constructor(visibility=true,color=getRandomColor(),points=[]){
        this.visibility = visibility;
        this.color = color;
        this.points = points;
        this.polygon = false;
    }
    addPoint(newPoint) {
        this.points.push(newPoint);
        if(this.points.length > 1) {
            this.points[this.points.length-2].setNextNode(newPoint.position,newPoint.color);
        }
    }
    deletePoint(pointIndex) {
        //set the previous point to connect with the next point
        if(pointIndex-1 >= 0 && pointIndex+1 < this.points.length) {
            this.points[pointIndex-1].setNextNode(this.points[pointIndex+1]);
        }
        this.points.splice(pointIndex,1);
        //if there are 2 or less points, the points can't form a polygon / be complete
        if(this.points.length <= 2 && this.points.length > 0) {
            this.points[this.points.length-1].setNextNode(null);
            this.polygon = false;
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
        return new ImageLayer(this.visibility,[...this.color],clonedPoints);
    }
}

export default ImageLayer;