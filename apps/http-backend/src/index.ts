import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { compare, hash } from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";
import { SigninSchema, SignupSchema } from "@repo/common/zodSchema";
import { prismaClient } from "@repo/db/client";
import { auth } from "./middleware";

const PORT = 3002;
const app = express();

app.use(express.json());

app.post("/", (req: Request, res: Response) => {
  console.log(req);
  res.send("hello");
});

app.post("/signup", async (req: Request, res: Response) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Validation error",
      errors: parsedData.error.errors.map((err) => ({
        path: err.path,
        message: err.message,
      })),
    });
    return;
  }

  try {
    const { email, username, password } = parsedData.data;
    const hashedPassword = await hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({
      type: "success",
      msg: "Signup successful",
      data: { token },
    });
  } catch (e) {
    res.status(500).json({
      type: "error",
      msg: "Signup failed",
      error: e,
    });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Validation error",
      errors: parsedData.error.errors.map((err) => ({
        path: err.path,
        message: err.message,
      })),
    });
    return;
  }
  const {email,password} = parsedData.data;
  try {
    const user = await prismaClient.user.findFirst({
      where: { email:email },
    });
    if (user) {
      const passCompare = await compare(password, user.password);
      if (passCompare) {
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.status(200).json({
          type: "success",
          msg: "Signin successful",
          data: { token },
        });
        return;
      } else {
        res.status(403).json({
          type: "error",
          msg: "Incorrect Password",
        });
        return;
      }
    }
    res.status(403).json({
      type: "error",
      msg: "user does not exist",
    });
    return;
  } catch (e) {
    res.status(500).json({
      type: "error",
      msg: "Signin failed",
      error: e,
    });
  }
});

app.post("/room",auth, async (req:Request, res:Response) => {
  const { name } = req.body;
  // @ts-ignore
  const userId = req.userId;
  console.log(userId + " " + name)
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: name,
        adminId: userId,
      },
    });
    console.log(room)
    res.status(200).json({
      type: "success",
      msg: "Room created",
      data: { roomId:room.id },
    });
  } catch (e) {
    res.status(500).json({
      type: "error",
      msg: "Room creation failed",
      error: e,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
