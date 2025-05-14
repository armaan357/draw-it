import z from 'zod';

export const SignupSchema = z.object({
    userName: z.string().email(),
    password: z.string().min(6).max(40)
                .refine(p => /[0-9a-zA-Z]/.test(p))
                .refine(p => /[!@#$%^&*]/.test(p)),
    profilePicture: z.string().url().optional(),
    firstName: z.string(),
    lastName: z.string()
});

export const SigninSchema = z.object({
    userName: z.string().email(),
    password: z.string().min(6).max(40)
                .refine(p => /[0-9a-zA-Z]/.test(p))
                .refine(p => /[!@#$%^&*]/.test(p))
});

export const CreateRoomSchema = z.object({
    roomId: z.string()
});

export interface Imsg {
    purpose: 'join' | 'leave' | 'chat';
    roomId: string;
    message?: string;
    userName?: string;
};

export type chatType = {
    id: number;
    message: string;
    userId: string;
    roomId: number;
};