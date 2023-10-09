require('dotenv').config()
const pino = require('pino');

const fileTransport = pino.transport({
    targets: [
        {
            level: process.env.PINO_LOG_LEVEL || 'warn',
            target: 'pino/file',
            options: { destination: `${__dirname}/app.log` },
        },
        {
            level: process.env.PINO_LOG_LEVEL || 'warn',
            target: 'pino-pretty',
        },
    ],
});

module.exports = pino(
    {
        level: process.env.PINO_LOG_LEVEL || 'warn',
        // level: 'trace',
    },
    fileTransport
);


// logger.fatal('fatal');
// logger.error('error');
// logger.warn('warn');
// logger.info('info');
// logger.debug('debug');
// logger.trace('trace');
