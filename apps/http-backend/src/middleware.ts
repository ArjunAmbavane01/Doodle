import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req?.header("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    res.status(401).json({
      type: "error",
      msg: "Token not present",
    });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log(payload)
    // @ts-ignore
    req.userId = payload.userId.toString();
    // @ts-ignore
    console.log(req.userId)
    next();
  } catch (e: unknown) {
    res.status(500).json({
      type: "error",
      msg: "Invalid or expired token",
      error: e,
    });
    return;
  }
};
