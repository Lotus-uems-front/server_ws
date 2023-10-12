require('dotenv').config();
const { Server } = require('socket.io')
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

const io = new Server({}) // * WS Server connection

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


//* socket.io подключение
io.on('connection', async (socket) => {
    try {
        console.log(`CONNECTING`); // test
        //* исходящее сообщение
        socket.emit('text', 'HELLO!!! My name is SERVER')

        //* входящие сообщения
        socket.on('message', async (message) => {
            const msg = JSON.parse(message)

            // todo: сделать обработчик входящих сообщений
            console.log(`MESSAGE::: `, msg) // test
            const result = await doConnectionChat(msg, await DB())

            if (result) {
                socket.emit('message chat', result)
            }
        });
    } catch (err) {
        console.log(`Ошибка в socket.io: `, err);
    }


})

io.listen(PORT_WS)
