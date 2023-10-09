require('dotenv').config();
const WebSocket = require('ws'); // ws
// const { WebSocketServer } = require('ws');
const express = require("express");
const cors = require('cors'); //отключает CORS
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const logger = require('./logger');

const doConnectionChat = require('./src/chat/doConnectionChat');

const app = express();
const jsonParser = express.json();

app.use(cors()); // отключает CORS
app.use(jsonParser);

const PORT_WS = process.env.PORTWS || 3031;

//* подключение к Mongodb
const dbName = 'usersdb';
// const url = `mongodb://localhost:27017`;
// const url = `mongodb://127.0.0.1:27017`;
const url = `mongodb://0.0.0.0:27017`;
const clientPromise = new MongoClient(url, { useUnifiedTopology: true, maxPoolSize: 10 }); // новое подключение

//* объект подключения к mongodb
app.use(async (req, res, next) => {
    try {
        const client = await clientPromise.connect();
        req.db = client.db(dbName);
        next();
    } catch (err) {
        // console.log(chalk.red(`Ошибка формирования объекта подключения к mongodb, ERROR: `, err));
        logger.error(err, `Error, create Object MongoDB`)
        next(err);
    }
})

/**
 * функция подключения к MongoDB
 * @returns 
 */
const DB = async () => {
    try {
        const client = await clientPromise.connect();
        return client.db(dbName);
    } catch (err) {
        console.log('Ошибка при получении объекта DB: ', err);
    }
}

//* создание WSS, подключение по порту  (на FRONTENDE указать URL до сервера, для стыковки WS)
const wss = new WebSocket.Server({ port: PORT_WS },
    () => {
        logger.info(`Server WS listens port for chat, PORT: ${PORT_WS}`); // logger
        console.log(`Server WS listens port for chat, PORT: ${PORT_WS}`);
    }
); // ws

//* WS подключение
wss.on('connection', (ws, req) => {
    console.log(`CONNECTING`); // test
    ws.send(JSON.stringify({ 'Ответ с сервера': 'ОТВЕТ С СЕРВЕРА, подключение WS' })) // сообщене для клиента

    console.log(`WS chat from IP: `, req.socket.remoteAddress); // test
    console.log(`HEADERS: `, req.headers); // test
    console.log(`websocket KEY: `, req.headers['sec-websocket-key']); // test

    ws.on('close', () => {
        console.log(`CLOSE WS `);
    })

    ws.on('message', async (message) => {

        const msg = JSON.parse(message)
        let resultChat;

        if (msg.method === 'end_chat') {
            console.log(`Закрыли соединение WS на FRONT`);
            resultChat = await doConnectionChat(msg, await DB())

        } else {
            resultChat = await doConnectionChat(msg, await DB())

            wss.clients.forEach(client => {

                if (client.readyState === WebSocket.OPEN) {

                    // ? необходимость этой проверки, если есть подобная на клиенте???
                    if (resultChat._id === msg.id) {
                        client.send(JSON.stringify(resultChat))
                    }
                }
            })
        }
    });
})

