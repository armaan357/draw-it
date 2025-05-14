import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";

function verifyUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authheader;
    if(!authHeader) {
        res.json({ error: 'Unauthorized' });
        return;
    }
    const token = (authHeader as string).split(" ")[1];

    try {

        const verify = jwt.verify(token!, JWT_SECRET!);
        if(!verify) {
            res.json({ error: 'Unauthorized' });
            return;
        }
        req.userId = (verify as JwtPayload).id;
        next();
    }catch(e: any) {
        res.json({ error: e.toString() });
    }
}

export default verifyUser;