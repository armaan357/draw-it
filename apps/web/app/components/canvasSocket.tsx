"use client";
import {  Dispatch, SetStateAction, useEffect, useState } from "react";
import { HTTP_URL, shapesType, WS_URL } from "../utils";
import { CanvasSocketClient } from "./canvasSocketClient";
import axios from "axios";

export function CanvasSocket({ allShapes, slug, setShapes }: {
    allShapes: shapesType[];
    slug: string;
    setShapes: Dispatch<SetStateAction<shapesType[]>>;
}) {
    const [ socket, setSocket ] = useState<WebSocket | null>(null);
    const [ loading, setLoading ] = useState<boolean>(true);
    
    useEffect(() => {
        let ws: WebSocket | null = null;
        axios.get(`${HTTP_URL}/connect-room/${slug}`, { withCredentials: true })
            .then((resp) => {
                if(!resp ) {
                    return;
                }
                ws = new WebSocket(`${WS_URL}?token=${resp.data.token}`);
                ws.onopen = () => {
                    setSocket(ws);
                }
                console.log('resp in canvasSock = ', resp.data.shapes);
                
                setShapes(s => s = [...resp.data.shapes]);
                console.log('allshapes in canvasSock = ', allShapes);
                // getShapes();
            })
            .catch((e) => {
                if(e.status == 401) {
                    window.location.href = 'http://localhost:3000/signin';
                }
                return <div>
                    Unauthorized user
                </div>
            });
            
            return () => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
    }, []);


    async function getShapes() {
        const resp = await axios.get(`${HTTP_URL}/shape/${slug}`, { withCredentials: true });
        if(!resp || resp.data.error) {
            console.log('Error', resp.data.error);
            return <div>
                Error!
            </div>
        }
        allShapes = [...resp.data.shapes];
        // setAllShapes([...(resp.data.shapes)]);
        console.log('allshapes in canvas socket = ', allShapes);
        setLoading(l => l = false);
    }
    
    if(!socket) {
        return (
            <div className="h-screen w-screen bg-black flex justify-center items-center">
                <div className="text-white text-xl">
                    Loading...
                </div> 
            </div>
        )
    }
    return (
        <div>
            {
                <CanvasSocketClient socket={socket} allShapes={allShapes} slug={slug} setShapes={setShapes} />
            }
        </div>
        
        
    )
}