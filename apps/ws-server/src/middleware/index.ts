import jwt, { JwtPayload } from "jsonwebtoken";

export default function verify(token: string, JWT_SECRET: string): false | string {
    try {
        const verify = jwt.verify(token, JWT_SECRET!);
        if(!verify || !(verify as JwtPayload).id) {
            return false;
        }
        return (verify as JwtPayload).id;
    }catch(e: any) {
        console.log("error = ", e.toString());
        return false
    }
}