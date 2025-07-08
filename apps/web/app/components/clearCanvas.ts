import { shapesType } from "../utils";

export function clearCanvas(ctx: CanvasRenderingContext2D, allShapes: shapesType[], canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(!allShapes) {
        // console.log('All shapes does not exist');
        return;
    }

    if(allShapes.length === 0) {
        return;
        
    }
    // console.log('allshapes now while rendering = ', allShapes);
    allShapes.map((s) => {
        if(s.type === 'rect') {
            ctx.beginPath();
            ctx.roundRect(s.x, s.y, s.width, s.height, Math.abs((s.width + s.height) / 50));
            ctx.stroke();
        }
        else if(s.type === 'circle') {
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, s.radX, s.radY, 0, 0, 2*(Math.PI), false);
            ctx.stroke();
        }
        else if(s.type == 'line') {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.toX, s.toY);
            ctx.stroke();
        }
        else if(s.type == 'draw') {
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            s.allCoordinates.map((a) => ctx.lineTo(a.x, a.y));
            ctx.stroke();
            // ctx.beginPath();
            // ctx.moveTo(s.x, s.y);
            // ctx.lineTo(s.toX, s.toY);
            // ctx.stroke();
        }
        else if(s.type == 'text') {
            ctx.fillStyle = 'white';
            ctx.fillText(s.text, s.x, s.y);
        }
    });
}