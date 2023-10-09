/**
 * 
 * @param {Object} msg объект сообщения
 * @param {Object} DB объект базы данных
 * @returns void - в DB дописывает объект состояния чата: lookStatus = false
 */
module.exports = async (msg, DB) => {
    try {
        // console.log(`MSG:::: `, msg); // test
        const result = await DB.collection('trade_chat').findOne({ _id: msg.id }) // чат, сообщения
        let arrDataInn;

        if (msg.data.filterAll && msg.data.filterAll[0] === 'all') {
            arrDataInn = msg.idCompany;
        } else {
            arrDataInn = msg.data.filterAll
        }

        const promiseInn = arrDataInn.map(item => {
            return (async () => {
                const data = { id: msg.id, lookStatus: false }

                const resultData = await DB.collection('chat_message')
                    .findOne({ _id: item })

                if (resultData && resultData.data.find(itm => itm.id === msg.id)) {
                    const data = resultData.data.map(el => {

                        if (el.id === msg.id) return { id: el.id, lookStatus: false }
                        if (el.id !== msg.id) return el
                    })

                    const resultChange = await DB.collection('chat_message')
                        .replaceOne({ _id: item }, { data })

                    return resultChange;

                } else {
                    const result = await DB.collection('chat_message')
                        .findOneAndUpdate({ _id: item }, { $addToSet: { data } }, { upsert: true });

                    return result;
                }
            })();
        })
        const resultPromises = await Promise.all(promiseInn);

    } catch (err) {
        console.log(`Информации о последнем сообщении нет: `, err);
    }
}