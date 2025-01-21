import express from 'express';

const PORT = 3002;
const app = express();

app.get('/',((req,res)=>{
    console.log(req)
}))

app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
})