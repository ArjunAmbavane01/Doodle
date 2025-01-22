import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";


const wss = new WebSocketServer({port:8080});

wss.on('connection',(ws,req)=>{
    console.log(`New connection made ${ws}`)
    const reqURL = req.url;
    if(!reqURL) return null;
    const queryParams = new URLSearchParams(reqURL.split('?')[1]);
    const token = queryParams.get('token');
    const successMsg = JSON.stringify({
        type:'success',
        msg:'Welcome!'
    })

    if(token){
        try{
            const payload = jwt.verify(token,JWT_SECRET);
            if(typeof payload === 'string'){
                ws.close();
                return;
            }
            if(!payload || !payload.userId){
                return ws.close();
            }
            ws.send(successMsg);
        } catch(e){
            return ws.close()
        }
    }

    ws.on('message',(data)=>{
        console.log(data);
        ws.send('pong');
    })
})
