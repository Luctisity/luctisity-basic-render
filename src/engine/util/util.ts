export function ajustToCanvasSize (x: number, y: number, canvasWidth: number, canvasHeight: number) {
    return [x / canvasWidth, y / canvasHeight];
}