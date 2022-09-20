export const DEG_TO_RAD =  Math.PI/180;

export function transformSizeCoords (x: number, y: number, canvasWidth: number, canvasHeight: number) {
    let [newX, newY] = [x / (canvasWidth*0.5), y / (canvasHeight*0.5)];
    //let [sinR, cosR] = [Math.sin(rot), Math.cos(rot)];


    return [newX, newY];
}

export function transformPosCoords (x: number, y: number, canvasWidth: number, canvasHeight: number) {
    return [x / (canvasWidth*0.5) - 1, y / (canvasHeight*0.5) - 1];
}

export function transformRotCoords (degrees: number) {
    return degrees * DEG_TO_RAD;
}

export function transformScaleCoords (x: number, y: number) {
    return [x * 0.01, y * 0.01];
}