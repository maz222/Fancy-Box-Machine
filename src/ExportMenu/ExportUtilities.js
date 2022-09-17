import { saveAs } from "file-saver";
import JSZip from "jszip";

function parseLayers(layers) {
    var tempData = {points:[],images:[]}
    layers.forEach((layer,index) => {
        if(layer.polygon) {
            var parsedPoints = [];
            layer.points.forEach((point,index) => {
                parsedPoints.push([point.position.x,point.position.y]);
            })
            var parsedPoints = {name:layer.name,points:parsedPoints,'z-Index':index};
            var parsedImage = {name:layer.name,image:null};
            tempData.points.push(parsedPoints);
            tempData.images.push(parsedImage);
        }
    });
    return tempData;
}

function cropPoints(parsedPoints) {
    var top = parsedPoints[0][1];
    var left = parsedPoints[0][0];
    parsedPoints.forEach((point,index) => {
        top = Math.min(point[1],top);
        left = Math.min(point[0],left);
    })
    for(var i=0; i<parsedPoints.length; i++) {
        parsedPoints[0] -= left;
        parsedPoints[1] -= top;
    }
}

export function exportData(layers,imageBlobs) {
    var parsedData = parseLayers(layers);
    const zip = new JSZip();
    //add folders for each layer
    console.log(imageBlobs);
    parsedData.points.forEach((points, index) => {
        var dataBlob = new Blob([JSON.stringify(points)], {type: "application/json"});
        zip.file(`${points.name}/points.json`,dataBlob);
        zip.file(`${points.name}/image.png`,imageBlobs[index]);
        //add image
    })
    //add overall point list
    var summaryBlob = new Blob([JSON.stringify(parsedData.points)], {type: "application/json"});
    zip.file('summary.json',summaryBlob);
    //add overall image
    zip.generateAsync({type:'blob'}).then((content) => {
        saveAs(content,'labelData.zip');
    })
    //saveAs(dataBlob,"labelData.json");
}