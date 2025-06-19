import { Dispatch, RefObject, SetStateAction, } from "react";
import { shapesType, coordinatesType } from "../utils";
import sendShapes from "./sendShapes";
import { clearCanvas } from "./clearCanvas";

export function canvasContext(canvas: HTMLCanvasElement, startX: RefObject<number>, startY: RefObject<number>, allShapes: shapesType[], roomId: string | null, socket: WebSocket | undefined, setShapes: Dispatch<SetStateAction<shapesType[]>>) {
    const ctx = canvas.getContext('2d');
    const userName: string | null = localStorage.getItem('userName') ? localStorage.getItem('token') : null;
    console.log('context roomId = ', roomId);
    if(!ctx) {
        return;
    }
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.letterSpacing = '2px';
    ctx.fontKerning = 'normal';
    ctx.font = '16px cursive';
    let clicked = false;
    console.log('allshapes in canvas context = ', allShapes);
    clearCanvas(ctx, allShapes, canvas);
    
    let allCoordinates: coordinatesType[] = [];
    let text: string = "";
    
    canvas.addEventListener("mousedown",(e) => {
        // e.preventDefault();
        //@ts-ignore
        const currShape: string | null = window.selectedShape;
        if(currShape === null) {
            return;
        }
        clicked = true;
        startX.current = e.clientX;
        startY.current = e.clientY;
        console.log('mouse down');
        if(currShape == 'select') {
            console.log(`selecting at coordinates => x: ${e.clientX}, y: ${e.clientY}`);
            return;
        }
        if(currShape == 'text') {
            document.addEventListener('keydown', writeText);
        }
    });

    const writeText = (e: KeyboardEvent) => {
        console.log('key pressed = ', e.key);
        //@ts-ignore
        const currShape: string | null = window.selectedShape;
        if(e.key == 'Escape') {
            document.removeEventListener('keydown', writeText);
            const shape: shapesType = {
                type: 'text',
                x: startX.current,
                y: startY.current,
                text: text
            }
            let tempShapes: shapesType[] = allShapes;
            tempShapes.push(shape);
            setShapes([...tempShapes]);
            text = "";
            clearCanvas(ctx, allShapes, canvas);
            //@ts-ignore
            window.selectedShape = 'select';
            return;
        }
        if(currShape === null) {
            return;
        }
        else if(currShape == 'text') {
            clearCanvas(ctx, allShapes, canvas);
            ctx.fillStyle = 'white';
            text += e.key;
            ctx.fillText(`${text}`, startX.current, startY.current);
        }
        
    }

    canvas.addEventListener('mouseup', (e) => {
        // e.preventDefault();  
        //@ts-ignore
        const currShape: string | null = window.selectedShape; 
        if(!clicked || currShape == null) {
            return;
        }
        clicked = false;
        console.log('mouseup');
        console.log('currshape after mouse up = ', currShape );
        let shape: shapesType | null = null;

        if(currShape === 'rect') {
            let width = e.clientX - startX.current;
            let height = e.clientY - startY.current;
            shape = {
                type: 'rect',
                x: startX.current,
                y: startY.current,
                width,
                height
            }
            console.log(shape);
        }
        else if(currShape === 'circle') {
            let centerX = (startX.current + e.clientX) / 2;
            let centerY = (startY.current + e.clientY) / 2;
            let radX = Math.abs(centerX - e.clientX);
            let radY =  Math.abs(centerY - e.clientY);
            shape = {
                type: 'circle',
                x: centerX,
                y: centerY,
                radX: radX,
                radY: radY
            };
            console.log(shape);
        }
        else if(currShape == 'line') {
            shape = {
                type: 'line',
                x: startX.current,
                y: startY.current,
                toX: e.clientX,
                toY: e.clientY
            }
            console.log(shape);
        }
        else if(currShape == 'draw') {
            shape = {
                type: 'draw',
                x: startX.current,
                y: startY.current,
                allCoordinates: allCoordinates
            }
            allCoordinates = [];
            console.log(shape);
        }
        if(!shape) {
            return;
        }

        let tempShapes: shapesType[] = allShapes;
        tempShapes.push(shape);
        setShapes([...tempShapes]);

        if(roomId) {
            console.log('sending');
            sendShapes(socket!, shape, roomId, userName!);
        }
        clearCanvas(ctx, allShapes, canvas);
    });

    canvas.addEventListener('mousemove', (e) => {
        // e.preventDefault();
        //@ts-ignore
        const currShape: string | null = window.selectedShape;
        if(!clicked || currShape === null) {
            return;
        }

        canvas.addEventListener('keydown', (e) => {
            console.log("key pressed = ", e.key);
        })

        if(currShape === 'rect') {
            let width = e.clientX - startX.current;
            let height = e.clientY - startY.current;
            clearCanvas(ctx, allShapes, canvas);
            ctx.beginPath();
            ctx.roundRect(startX.current, startY.current, width, height, (width + height) / 50);
            ctx.stroke();
        }
        else if(currShape === 'circle') {
            console.log('circle');
            let centerX = (startX.current + e.clientX) / 2;
            let centerY = (startY.current + e.clientY) / 2;
            let radX = Math.abs(centerX - e.clientX);
            let radY =  Math.abs(centerY - e.clientY);
            clearCanvas(ctx, allShapes, canvas);
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radX, radY, 0, 0, 2*(Math.PI), false);
            ctx.stroke();
        }
        else if(currShape == 'line') {
            console.log('line');
            clearCanvas(ctx, allShapes, canvas);
            ctx.beginPath();
            ctx.lineJoin = 'round';
            ctx.moveTo(startX.current, startY.current);
            ctx.lineTo(e.clientX, e.clientY);
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        else if(currShape == 'draw') {
            console.log('draw');
            allCoordinates.push({ x:  e.clientX, y: e.clientY });
            clearCanvas(ctx, allShapes, canvas);
            
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(startX.current, startY.current);
            allCoordinates.map((a) => ctx.lineTo(a.x, a.y));
            ctx.stroke();
        }
    })
}
