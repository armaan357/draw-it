import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Canvas } from "./canvas";
import { shapesType } from "../utils";

export function CanvasSocketClient({ socket, allShapes, slug, setShapes }: {
    socket: WebSocket;
    allShapes: shapesType[];
    slug: string;
    setShapes: Dispatch<SetStateAction<shapesType[]>>;
}) {
    const em = useRef<any>(null);
    // console.log('entered client socket');
    // console.log('allshapes in socket client = ', allShapes);
    try {
        useEffect(() => {
            // console.log('entered client socket try block');
            socket.send(JSON.stringify({
                purpose: 'join',
                roomId: Number(slug)
            }));

            const handleMessage = (e: MessageEvent) => {
                // console.log(typeof e.data);
                // console.log('type of msg = ', e.data);
                const resp = e.data;
                const msg = JSON.parse(resp);
                // console.log('msg  = ', msg);
                if(msg.error || !msg.type) {
                    // console.log(msg.error);
                    return;
                }
                // console.log('recent shape = ', msg.message);
                // console.log('message recieved at = ', (new Date).getHours(), " Hrs, ", (new Date).getMinutes(), " min, ", (new Date).getSeconds(), " sec");
                // console.log('shaep msg = ', JSON.parse(msg.message));
                // allShapes.push(JSON.parse(msg.message));
                const shape = JSON.parse(msg.message);
                const tempShapes = allShapes;
                tempShapes.push(shape);
                setShapes([...tempShapes]);
            }

            socket.addEventListener('message', handleMessage);
            return () => {
                socket.removeEventListener('message', handleMessage);
            }
        }, []);
    } catch(e: any) {
        // console.log("error = ",e);
    }

    useEffect(() => {
        // console.log('e = ', em.current);
        // console.log('type of em = ', typeof em.current)
    }, [em]);

    useEffect(() => {
        if(allShapes) {
            const i = allShapes.length - 1;
            // console.log('last shape = ', allShapes[i]);
        }
    }, [allShapes]);

    return (
        <Canvas allShapes={allShapes} socket={socket} slug={slug} setShapes={setShapes} />
    )
}