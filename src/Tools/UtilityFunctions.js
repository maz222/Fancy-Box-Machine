import { AppContext } from "../AppData/AppContext";

/*
takes a raw pixel position and normalizes it based on the image dimensions
x:0 = left most edge of the image, x:1 = right most edge
y:0 = top of the image, y:1 = bottom of the image
*/
export function getNormalizedPosition(pixelPos, canvas, appContext) {
    const rect = canvas.getBoundingClientRect();
    var position = [pixelPos.x-rect.left, pixelPos.y-rect.top];
    const imageSize = [appContext.image.width*appContext.zoom.amount, appContext.image.height*appContext.zoom.amount];
    const imageCenter = [canvas.width/2+appContext.zoom.offset[0]-imageSize[0]/2, canvas.height/2-appContext.zoom.offset[1]-imageSize[1]/2];
    position = [position[0]-imageCenter[0], position[1]-imageCenter[1]];
    position = [position[0]/imageSize[0], position[1]/imageSize[1]];
    return {x:position[0],y:position[1]};
}

export function getRawImagePosition(normPos, canvas, appContext) {
    //const canvasRect = canvas.getBoundingClientRect();
    const image = appContext.image;
    var imageRaw = {x:image.width*normPos.x,y:image.height*normPos.y};
    //canvasNorm.x *= canvasRect.width;
    //canvasNorm.y *= canvasRect.height;
    return imageRaw;
}