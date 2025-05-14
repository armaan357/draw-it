import { useEffect, useRef, useState } from "react";

export function useSocket(token: string) {

    const socket = useRef<WebSocket | null>(null);
    useEffect(() => {    
        const authHeader = token.split(' ')[1]; 
        const ws = new WebSocket(`ws://localhost:8080?token=${authHeader}`);

        ws.onopen = () => {
            socket.current = ws;
        }
        
    }, []);

    return socket.current;
}