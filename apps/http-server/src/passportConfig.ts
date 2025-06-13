import { prisma } from "@repo/db/client";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from 'bcrypt';

passport.use(new LocalStrategy(
    { usernameField: 'userName' }, async (userName, password, done) => {

        try {
            const user = await prisma.users.findFirst({ where: { userName: userName } });
            if(!user) {
                return done(null, false, { message: 'Incorrect UserName' });
            }
            const comp = await bcrypt.compare(password, user.password);
            if(!comp) {
                return done(null, false, { message: 'Incorrect Password' });
            }
            return done(null, user);
        } catch(e: any) {
            return done(e);
        }
    }
));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.users.findFirst({ where: { id: id } });
        done(null, user);
    }catch(e: any) {
        done(e);
    }
    
});

export default passport;