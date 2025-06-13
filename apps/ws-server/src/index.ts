import { WebSocketServer, WebSocket } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import verify from "./middleware";
import { prisma } from "@repo/db/client";
import { Imsg, shapesType } from "@repo/common/types";

const wss = new WebSocketServer({ port: 8080 });

interface Iusers {
    ws: WebSocket;
    rooms: number[];
    userId: string;
}

const users: Iusers[] = [];

wss.on('connection', (ws, Request) => {
    const url = Request.url;

    if(!url) {
        ws.close();
        return;
    }

    const query = new URLSearchParams(url.split("?")[1]);
    const token = query.get('token') || "";
    const isVerified = verify(token, JWT_SECRET);
    if(!isVerified) {
        ws.close()
        return;
    }
    users.push({ ws: ws, rooms: [], userId: isVerified});
    ws.send(JSON.stringify({ message: 'Connection established'}));

    ws.on('message', async (data) => {

        try {
            const parsed: Imsg = JSON.parse(data as unknown as string);
        
            if(parsed.purpose === 'join') {
                const room = await prisma.rooms.findFirst({ where: { id: Number(parsed.roomId) } });
                if(!room) {
                    ws.send(JSON.stringify({ error: 'Room does not exist' }));
                    return;
                }

                if(!Number(parsed.roomId)) {
                    ws.send(JSON.stringify({error: 'Please specify a valid room ID'}));
                    return;
                }
                if(Number(parsed.roomId) === null) {
                    return;
                }
                const user = users.find((u) => u.ws === ws);
                if(!user) {
                    return;
                }
                if(user.rooms.includes(Number(parsed.roomId))) {
                    ws.send(JSON.stringify({error: `You have already joined this room`}));
                    return;
                }
                user.rooms.push(Number(parsed.roomId));
                // console.log("all users = ", users);
                ws.send(JSON.stringify({message: `Joined room ${Number(parsed.roomId)}`}));
                
                // console.log("users = ", users);
            }

            else if(parsed.purpose === 'leave') {

                if(!Number(parsed.roomId)) {
                    ws.send(JSON.stringify({error: 'Please specify a valid room ID'}));
                    return;
                }
                const user = users.find((u) => u.ws === ws);
                if(!user) {
                    return;
                }
                user.rooms = user.rooms.filter(r => r !== Number(parsed.roomId));
            }

            else if(parsed.purpose === 'chat') {

                if(!Number(parsed.roomId) || !parsed.message) {
                    ws.send(JSON.stringify({error: 'Room ID/ message not found'}));
                    return;
                }

                const user = users.filter(u => u.userId === isVerified);
                if(!user || user.length === 0) {
                    ws.send(JSON.stringify({error: 'You need to join the room before sending messages to the room'}));
                    return;
                }
                console.log("parsed = ", parsed);
                console.log("user rooms = ", user[0]?.rooms);
                console.log('userId = ', user[0]?.userId);
                if(!user[0]?.rooms.includes(Number(parsed.roomId))) {
                    ws.send(JSON.stringify({error: 'You have not joined this room'}));
                    return;
                }

                try {
                    const room = await prisma.rooms.findFirst({ where: { id: Number(parsed.roomId) } });
                    if(!room) {
                        ws.send(JSON.stringify({error: 'Room does not exist'}));
                        return;
                    }
                    const msg: shapesType = JSON.parse(parsed.message);
                    console.log("msg = ", msg);
                    console.log('type = ', msg.type);
                    if(msg.type == 'rect') {

                        ;const resp = await prisma.chats.create({ data: { 
                            type: 'rect', 
                            x: msg.x, 
                            y: msg.y,
                            width: msg.width,
                            height: msg.height,
                            roomId: room.id, 
                            userId: isVerified
                        }});
                        console.log('rect resp = ', resp);
                    }
                    else if(msg.type == 'circle') {
                        const resp = await prisma.chats.create({ data: { 
                            type: 'circle', 
                            x: msg.x, 
                            y: msg.y,
                            radX: msg.radX,
                            radY: msg.radY,
                            roomId: room.id, 
                            userId: isVerified
                        }});
                        console.log('circle resp = ', resp);
                    }
                    else if(msg.type == 'line') {
                        const resp = await prisma.chats.create({ data: { 
                            type: 'line', 
                            x: msg.x, 
                            y: msg.y,
                            toX: msg.toX,
                            toY: msg.toY,
                            roomId: room.id, 
                            userId: isVerified
                        }});
                        console.log('line resp = ', resp);
                    }
                    else if(msg.type == 'draw') {
                        const resp = await prisma.chats.create({ data: { 
                            type: 'draw', 
                            x: msg.x, 
                            y: msg.y,
                            allCoordinates: msg.allCoordinates,
                            roomId: room.id, 
                            userId: isVerified
                        }});
                        console.log('line resp = ', resp);
                    }
                    else if(msg.type == 'text') {
                        const resp = await prisma.chats.create({ data: { 
                            type: 'text', 
                            x: msg.x, 
                            y: msg.y,
                            text: msg.text,
                            roomId: room.id, 
                            userId: isVerified
                        }});
                        console.log('line resp = ', resp);
                    }
                    // const shape = await prisma.create({ data: { type: msg.type, x: msg.x, y: msg.y, }});
                    
                    users.forEach((user) => {
                        if(user.rooms.includes(Number(parsed.roomId))) {
                            user.ws.send(JSON.stringify({
                                type: 'chat',
                                message: parsed.message,
                                roomId: Number(parsed.roomId),
                                userName: parsed.userName
                            }));
                            
                        }
                    })
                } catch(e: any) {
                    ws.send(JSON.stringify({
                        message: 'Error! Please try again',
                        error: JSON.stringify(e)
                    }));
                }  
            }
            else {
                ws.send(JSON.stringify({error: 'Not a valid action'}));
            } 
        }catch(e: any) {
            ws.send(e.toString());
        }
        
    });
});