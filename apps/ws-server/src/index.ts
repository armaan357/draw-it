import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import verify from "./middleware";
import { prisma } from "@repo/db/client";
import { Imsg } from "@repo/common/types";

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
    ws.send('Connection established');

    ws.on('message', async (data) => {

        try {
            const parsed: Imsg = JSON.parse(data as unknown as string);
        
            if(parsed.purpose === 'join') {
                const room = await prisma.rooms.findFirst({ where: { id: Number(parsed.roomId) } });
                if(!room) {
                    ws.send('Room does not exist');
                    return;
                }

                if(!Number(parsed.roomId)) {
                    ws.send('Please specify a valid room ID');
                    return;
                }
                if(Number(parsed.roomId) === null) {
                    return;
                }
                const user = users.find((u) => u.ws === ws);
                if(!user) {
                    return;
                }
                user.rooms.push(Number(parsed.roomId));
                ws.send(`Joined room ${Number(parsed.roomId)}`);
                // console.log("users = ", users);
            }

            else if(parsed.purpose === 'leave') {

                if(!Number(parsed.roomId)) {
                    ws.send('Please specify a valid room ID');
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
                    ws.send('Room ID/ message not found');
                    return;
                }

                const user = users.filter(u => u.userId === isVerified);
                if(!user || user.length === 0) {
                    ws.send('You need to join the room before sending messages to the room');
                    return;
                }
                if(!user[0]?.rooms.includes(Number(parsed.roomId))) {
                    ws.send('You have not joined this room');
                    return;
                }

                try {
                    const room = await prisma.rooms.findFirst({ where: { id: Number(parsed.roomId) } });
                    if(!room) {
                        ws.send('Room does not exist');
                        return;
                    }

                    await prisma.chats.create({ data: { message: parsed.message, roomId: room.id, userId: isVerified}});
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
                    ws.send(`Error! Please try again, error =  ${e}`);
                }  
            }
            else {
                ws.send('Not a valid action');
            } 
        }catch(e: any) {
            ws.send(e.toString());
        }
        
    });
});