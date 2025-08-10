"use client";
import { useState } from "react";
import { CanvasSocket } from "../../components/canvasSocket";
import { shapesType } from "../../utils";
// import { useDynamicRouteParams } from "next/dist/server/app-render/dynamic-rendering";
import { useParams } from "next/navigation";

export default function RoomCanvas() {

    const { roomId }  = useParams<{ roomId: string }>();
    // const allShapes: shapesType[] = [];
    const [ shapes, setShapes ] = useState<shapesType[]>([]);
    return (
        <CanvasSocket allShapes={shapes} slug={roomId} setShapes={setShapes} />
    )
}