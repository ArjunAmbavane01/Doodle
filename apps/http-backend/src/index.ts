import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {SignupSchema} from "@repo/common/zodSchema";
import {prismaClient} from "@repo/db/client";

const PORT = 3002;
const app = express();

app.use(express.json());

app.post("/", (req: Request, res: Response) => {
  console.log(req);
  res.send("hello");
});

app.post("/signup", (req: Request, res: Response) => {
  const data = SignupSchema.safeParse(req.body);
  if(!data.success){
    res.status(400).json({
      type:'error',
      msg:'Invalid Input',
      err:data
    })
    return;
  }
  console.log(req);
  try {
    const conn = prismaClient.$connect();
    const id = 1; // Replace with actual user creation logic
    const token = jwt.sign({ userId: id }, JWT_SECRET);
    res.status(200).json({
      type: "success",
      msg: "Signup successful",
      data: { token },
    });
    return;
  } catch (e) {
    res.status(500).json({
      type: "error",
      msg: "Signup failed",
      error: e,
    });
    return;
  }
});

app.post("/signin", (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = { id: "1", username: "arjun", password: "12" }; // Replace with actual user fetching logic
    if (user && user.password === password) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.status(200).json({
        type: "success",
        msg: "Signin successful",
        data: { token },
      });
      return;
    }
    res.status(403).json({
      type: "error",
      msg: "Invalid credentials",
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

// app.get('/room', ((req, res) => {
//     const { username, password } = req.body;
//     = user.create({ username, password });
//     const token =

// }))

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
