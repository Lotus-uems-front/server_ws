const changeStatusChat = require("./changeStatusChat");
const lookWriteChat = require("./lookWriteChat");

module.exports = async (msg, DB) => {

    const idDocum = { _id: msg.id };

    console.log(`MESSAGE::: `, msg.data); // сообщенеи с клиента
    switch (msg.method) {

        case 'connection':
            console.log('connection', msg.message, msg.id);
            console.log(`Подклчился: ${msg.nameInn}`);
            return await readAllChat(DB, idDocum);
            break;

        case 'get_data_chat':
            console.log('get_data_chat', msg.message);
            console.log('NOTHING');
            break;

        case 'create_new_chat':
            console.log('create_new_chat', msg.message);
            return await createNewChat(DB, msg.data, idDocum);
            break;

        case 'send_new_message':
            console.log('send_new_message', msg.message);
            await lookWriteChat(msg, DB);
            return await writeNewMessage(DB, msg.data, idDocum);
            break;

        case 'end_chat':
            console.log('end_chat', msg.message);
            await changeStatusChat(msg, DB)
            break;
    }
}

// создание нового чата
const createNewChat = async (DB, data, idDocum) => {

    await DB.collection('trade_chat')
        .insertOne(idDocum, data);

    return await readAllChat(DB, idDocum);
}

// добавление новой записи в чат
const writeNewMessage = async (DB, data, idDocum) => {

    await DB.collection('trade_chat')
        .updateOne(idDocum, { $push: { data } });

    return await readAllChat(DB, idDocum);
}

// из БД получаем все записи чата
const readAllChat = async (DB, idDocum) => {
    try {
        const data = await DB.collection('trade_chat')
            .findOne(idDocum)

        return data

    } catch (err) {
        console.log(`Ошибка при обращении к БД в WS: `, err);
    }

}