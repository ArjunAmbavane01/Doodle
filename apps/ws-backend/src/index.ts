import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const checkUser = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === "string") return null;
    if (!payload || !payload.userId) return null;

    return payload.userId;
  } catch (e) {
    return null;
  }
};

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  ws: WebSocket;
  rooms: string[];
}
const users: User[] = [];

wss.on("connection", (ws, req) => {
  const reqURL = req.url;
  if (!reqURL) return;
  const queryParams = new URLSearchParams(reqURL.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    ws,
    rooms: [],
  });

  ws.on("message", async (data) => {
    try {
      const parsedData = JSON.parse(data as unknown as string);
      if (parsedData.type === "join_room") {
        const user = users.find((x) => x.ws === ws);
        // we shold check if room exists or not
        // also if user is already in that room
        user?.rooms.push(parsedData.roomId);
      }
      if (parsedData.type === "leave_room") {
        const user = users.find((x) => x.ws === ws);
        if (!user) return;
        user.rooms = user?.rooms.filter((x) => x === parsedData.roomId);
      }
      if (parsedData.type === "chat") {
        const { roomId, message } = parsedData;
        // ideally we should put this in a queue
        // also roomid here should be actual id not slug
        await prismaClient.chat.create({
            data:{
                message,
                roomId,
                userId
            }
        })
        users.forEach((user) => {
          if (user.rooms.includes(roomId))
            user.ws.send(JSON.stringify({ type: "chat", message, roomId }));
        });
      }
    } catch (e) {
      return null;
    }
  });
});
