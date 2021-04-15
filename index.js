const express = require('express');
const redis = require('redis');
const client = redis.createClient();
const app = express();

function process() {
    return new Promise(res => {
        setTimeout(() => res('processamento dificil'), 5000);
    });
}

function checkRedis(instance, ip) {
    return new Promise(res => {
        instance.get(ip, (err, acc) => res(acc));
    })
}

function clearKeys(instance) {
    return new Promise(resolve => {
        instance.flushall(() => resolve());
    })
}

const getIp = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

app.get('/', async (req, res) => {
    const ip = getIp(req);
    const time = new Date();

    let resposta;

    resposta = await checkRedis(client, ip);

    if(resposta == null) {
        resposta = await process();
        client.set(ip, resposta,  'EX', 60 * 10);
    }

    
    return res.json({
        time: ((new Date().getTime() - time.getTime())/ 1000) + ' segundos',
        res: resposta
    });
});

app.get('/clear', async (req, res) => {
    const ip = getIp(req);
    clearKeys(client);
    return res.status(200).send();
})

client.on("error", function(error) {
    console.error(error);
});


app.listen(3000);