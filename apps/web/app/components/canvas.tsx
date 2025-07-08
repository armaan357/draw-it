"use client"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { canvasContext } from "./canvasContext";
import { shapesType } from "../utils";
import { clearCanvas } from "./clearCanvas";
import { ShapeToolbar } from "./shapeToolbar";
import { CanvasMenu } from "./canvasMenu";
import { CustomizationToolbar } from './customizationToolbar'

export function Canvas({ allShapes, slug, socket, setShapes }: {
    allShapes: shapesType[];
    slug?: string;
    socket?: WebSocket;
    setShapes: Dispatch<SetStateAction<shapesType[]>>;
}) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const startX = useRef<number>(0);
    const startY = useRef<number>(0);
    const [ currShape, setCurrShape ] = useState<'rect' | 'circle' | 'line'| 'draw' | 'drag' | 'text' | 'eraser' | 'select' | null>(null);
    let roomId: string | null = slug ? slug : null;
    
    useEffect(() => {
        if(!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        console.log('allShapes in canas before context = ', allShapes);
        //@ts-ignore
        window.selectedShape = currShape;
        canvasContext(canvas, startX, startY, allShapes, roomId, socket, setShapes);
        // return () => {
        //     // Example cleanup: remove all event listeners from the canvas
        //     // (Assuming you add event listeners in canvasContext, you should remove them here)
        //     // You can also clear the canvas if needed
        //     if (canvas) {
        //         const clone = canvas.cloneNode(true) as HTMLCanvasElement;
        //         canvas.parentNode?.replaceChild(clone, canvas);
        //     }
        // };
    }, [canvasRef, currShape]);

    // useEffect(() => {
    //     //@ts-ignore
    //     window.selectedShape = currShape;
    // }, [currShape]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if(!ctx) {
            return;
        }
        clearCanvas(ctx, allShapes, canvas);
    }, [allShapes]);

    return (
        <div className="w-dvw h-dvh stroke-1 stroke-emerald-950 text-white flex justify-center">
            
            <canvas ref={canvasRef} width={1536} height={695} className="bg-[#101011] overflow-hidden"></canvas>
            <ShapeToolbar currShape={currShape} setCurrShape={setCurrShape} />
            <CustomizationToolbar />
            <CanvasMenu />
        </div>
    )
}