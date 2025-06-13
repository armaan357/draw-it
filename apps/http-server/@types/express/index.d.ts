import  Express, { Request } from 'express';

declare global{
    namespace Express{
        interface Request{
            userId?: string;
            session: {
                passport?: {
                    user?: string;
                };
            };
        }
    }
}