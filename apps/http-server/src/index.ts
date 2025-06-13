import express, { NextFunction, Request, Response } from 'express';
import { prisma } from '@repo/db/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import verifyUser from './middleware';
import { USER_SECRET, JWT_SECRET } from '@repo/backend-common/config';
import { SignupSchema, CreateRoomSchema } from '@repo/common/schema';
import cors  from 'cors';
import session from 'express-session';
import passport from './passportConfig';

const app = express();

interface Iusers {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
}

export let users: Iusers[] = []

app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: USER_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// used to initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'express in turbo repo' });
})

app.post('/signup', async (req: Request, res: Response) => {
    const requiredBody = SignupSchema;

    const parsed = requiredBody.safeParse(req.body);
    if(!parsed.success) {
        res.json({ error: parsed.error });
        return;
    }
    const { userName, password, profilePicture, firstName, lastName } = parsed.data;

    try{
        const hashed = await bcrypt.hash(password, 5);
        
        const resp = await prisma.users.create({ data: { userName, password: hashed, profilePicture, firstName, lastName } });
        if(!resp) {
            res.status(411).json({ error: 'Please try again' });
            return;
        }
        res.status(201).json({ message: 'Signed Up' });
    }
    catch(e :any) {
        if(e.code && e.code === "p2002") {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        res.status(500).json({ error: e });
    }
});

app.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: { id: number; userName: string; password: string; }, info: any) => {
        if(err) {
            return next(err);
        }
        if (!user) return res.status(400).json(info);

    req.logIn(user, (err) => {
      if (err) return next(err);
      const { id, userName } = user;
      return res.json({ user: { id, userName } });
    });
  })(req, res, next);
});

app.get('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ msg: 'Logged out' });
  });
});

app.get('/auth-me', verifyUser, async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Authorized User!' });
});

// app.post('/signin', async (req: Request, res: Response) => {
//     const requiredBody = SigninSchema;

//     const parsed = requiredBody.safeParse(req.body);
//     if(!parsed.success) {
//         res.json({ error: parsed.error });
//         return;
//     }
//     const { userName, password } = parsed.data;

//     try{
        
//         const user = await prisma.users.findFirst({ where: { userName } });
//         if(!user) {
//             res.json({ error: 'User does not exist please sign up and try again' });
//             return;
//         }
//         const hashed = await bcrypt.compare(password, user.password);
//         if(!hashed) {
//             res.json({ error: 'Incorrect Password' });
//             return;
//         }
//         console.log("secret key = ", USER_SECRET);
//         const token = jwt.sign({ id: user.id }, USER_SECRET!);
//         res.status(201).json({ message: 'Signed In', token: `Bearer ${token}`, userName: user.userName });
//     }
//     catch(e :any) {
//         res.json({ error: e.toString() });
//     }
// });

app.post('/create-room', verifyUser, async (req: Request, res: Response) => {
    const requiredBody = CreateRoomSchema;

    const parsed = requiredBody.safeParse(req.body);
    if(!parsed.success) {
        res.json({ error: parsed.error });
        return;
    }
    const { roomId } = parsed.data;
    const slug = roomId.replace(" ", "-");
    const userId = req.userId;

    try {
        const resp = await prisma.rooms.create({ data: { slug, adminId: userId! } });
        if(!resp) {
            res.json({ error: "Please try again" });
            return;
        }
        res.status(201).json({ message: `Room ${roomId} created`, id: resp.id });
    }
    catch(e :any) {
        if(e.code && e.code === "P2002") {
            res.status(401).json({ error: "Room already exists, please try another name" });
            return;
        }
        res.json({ error: e });
    }
});

app.post('/join-room', verifyUser, async (req: Request, res: Response) => {
    const requiredBody = CreateRoomSchema;

    const parsed = requiredBody.safeParse(req.body);
    if(!parsed.success) {
        res.json({ error: parsed.error });
        return;
    }
    const { roomId } = parsed.data;
    const userId = req.userId;

    try {
        const resp = await prisma.rooms.findFirst({ where: { slug: roomId } });
        if(!resp) {
            res.json({ error: "Please try again" });
            return;
        }
        res.status(201).json({ message: `Room ${roomId} exists`, id: resp.id });
    }
    catch(e :any) {
        // if(e.code && e.code === "P2002") {
        //     res.status(401).json({ error: "Room already exists, please try another name" });
        //     return;
        // }
        res.json({ error: e });
    }
});

app.get('/shape/:roomId', verifyUser, async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);
    console.log(`Request url = ${req.url}, method = ${req.method}, hostName = ${req.hostname}`);
    if(!roomId) {
        res.json({ error: 'Incorrect Inputs'});
        return;
    }
    try {
        const shapes = await prisma.chats.findMany({ 
            where: {
                roomId
            },
            orderBy: {
                id: 'desc'
            }, 
            include: {
                Users: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.json({ shapes });
    } catch(e: any) {
        res.json({ error: e.toString() });
    }
});

app.get('/room/:slug', verifyUser, async (req: Request, res: Response) => {
    const slug = req.params.slug;
    if(!slug) {
        res.json({ error: 'Incorrect inputs'});
        return;
    }
    try {
        const room = await prisma.rooms.findFirst({ 
            where: {
                slug
            }
        });
        
        res.json({ room });
    } catch(e: any) {
        res.json({ error: e.toString() });
    }
});

app.get('/connect-room/:slug', verifyUser, async (req: Request, res: Response) => {
    const roomId = Number(req.params.slug);
    if(!roomId) {
        res.json({ error: 'Room ID not provided' });
        return;
    }
    try {
        if(!req.session.passport) {
            res.json({ error: 'Please try again!' });
            return;
        }
        const id = req.session.passport.user;
        const token = jwt.sign({ id: id }, JWT_SECRET!);
        

        const shapes = await prisma.chats.findMany({ 
            where: {
                roomId
            },
            orderBy: {
                id: 'desc'
            },
            include: {
                Users: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.json({ shapes, message: 'Token generated and shapes fetched', token });
    } catch(e: any) {
        res.json({ error: e.toString() });
    }
    
});
 
app.listen(3001);