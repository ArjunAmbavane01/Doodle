import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(4),
  email: z.string().email(),
});

export const SigninSchema = z.object({
  password: z.string().min(4),
  email: z.string().email(),
});

export const roomSchema = z.object({
  room: z.string(),
});
