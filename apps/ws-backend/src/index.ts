import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({port:8080});

wss.on('connection',(ws)=>{
    console.log(`New connection made ${ws}`)
    ws.on('message',(data)=>{
        console.log(data);
        ws.send('pong');
    })
})
