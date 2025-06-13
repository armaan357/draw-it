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
        } catch(e) {
            return done(e);
        }
    }
));

passport.serializeUser((user, done) => {
    /*@ts-ignore*/
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        //@ts-ignore
        const user = await prisma.users.findFirst({ where: { id: id } });
        done(null, user);
    }
    catch(e) {
        done(e);
    }
    
});

export default passport;