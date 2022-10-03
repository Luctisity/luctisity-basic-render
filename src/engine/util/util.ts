export const DEG_TO_RAD =  Math.PI/180;

export function canvasSizeCompensate (canvasWidth: number, canvasHeight: number) {
    return [1/canvasWidth, 1/canvasHeight]
}

export function transformPosCoords (x: number, y: number, canvasWidth: number, canvasHeight: number) {
    return [x / canvasWidth - 1, y / canvasHeight - 1];
}

export function transformRotCoords (degrees: number) {
    return degrees * DEG_TO_RAD;
}

export function transformScaleCoords (x: number, y: number) {
    return [x * 0.01, y * 0.01];
}

export function transformColor (r: number, g: number, b: number, a: number) {
    return [r/255, g/255, b/255, a*0.01];
}

export function markiplierToSemitone (factor: number) { 
    return Math.log(factor) * Math.LOG2E * 12;
}