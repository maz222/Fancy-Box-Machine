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
    var imageRaw = {x:Math.floor(image.width*normPos.x),y:Math.floor(image.height*normPos.y)};
    //canvasNorm.x *= canvasRect.width;
    //canvasNorm.y *= canvasRect.height;
    return imageRaw;
}

//get general form of a line given two points along the line
export function getGeneralForm(p1, p2) {
    const slopeNumerator = p2.y-p1.y;
    const slopeDenominator = p2.x-p1.x;
    const slope = slopeNumerator/slopeDenominator;
    //y=mx+(b)
    const yIntercept = p1.y-(slope*p1.x);
    //console.log(`Line : [${p1.x},${p1.y}],[${p2.x},${p2.y}] - slope=${slopeNumerator}/${slopeDenominator} b=${yIntercept}`);
    //console.log(`A:${slopeNumerator}, B:${-slopeDenominator}, C:${slopeDenominator*yIntercept}`);
    return{
        A:slopeNumerator,
        B:-slopeDenominator,
        C:slopeDenominator*yIntercept
    };
}

//return the distance between a point and a line
export function getPointDistanceToLine(p1,l1) {
    //console.log(`Point: [${p1.x},${p1.y}]`);
    var generalForm = getGeneralForm(l1[0],l1[1]);
    var distance = Math.abs(generalForm.A*p1.x + generalForm.B*p1.y + generalForm.C)/Math.sqrt(Math.pow(generalForm.A,2)+Math.pow(generalForm.B,2));
    //console.log(`Distance: ${distance}`);
    return distance;
}