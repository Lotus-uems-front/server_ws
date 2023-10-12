/**
 * Меняет состояние чата
 * @param {Object} msg  сообщение чата
 * @param {Object} DB  объект базы данных
 * @returns void - Меняет в выбранном чате lookStatus на true
 */
module.exports = async (msg, DB) => {
    try {
        // console.log(`MSG:::: `, msg); // test
        const result = await DB.collection('chat_message')
            .findOne({ _id: msg.nameInn });
        let data

        if (result && result.data) {
            data = result.data.map(item => {

                if (item.id === msg.id) return { id: item.id, lookStatus: true }
                if (item.id !== msg.id) return item
            })
        }

        if (data && data.length) {
            const newResult = await DB.collection('chat_message')
                .replaceOne({ _id: msg.nameInn }, { data })
        }

    } catch (err) {
        console.log(`Ошибка в отслеживании статуса чата: `, err);
    }

}