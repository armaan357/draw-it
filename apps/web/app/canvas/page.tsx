"use client";
import { useState } from "react";
import { Canvas } from "../components/canvas";
import { shapesType } from "../utils";


export default function CanvasHomePage() {

    // const allShapes: shapesType[] = [];
    const [ shapes, setShapes ] = useState<shapesType[]>([{type: 'circle', x: 50, y: 50, radX: 20, radY: 15}, { type: 'line', x: 75, y: 80, toX: 150, toY: 140 }]);

    return (
        <Canvas allShapes={shapes} setShapes={setShapes} />
    )
}