import { shapesType } from "../utils";

export default function sendShapes(socket: WebSocket, shape: shapesType, roomId: string, userName: string) {
    const shapeString = JSON.stringify(shape);
    socket.send(JSON.stringify({
        purpose: 'chat',
        message: shapeString,
        roomId,
        userName
    }));
}