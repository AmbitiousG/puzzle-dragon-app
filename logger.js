const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const FETCH_START_STR = "start fetching monster [id: %d]";
const FETCH_END_STR = "end fetching monster [id: %d]: monster name: %s, monster name cn: %s";

const myFormat = printf((obj) => {
  const { level, message, timestamp } = obj;
  return `${timestamp}[${level}] ${message}`;
});

const logger = createLogger({
  format: combine(
    // label({ label: 'right meow!' }),
    timestamp(),
    format.splat(),
    myFormat
  ),
  transports: [
    new transports.File({
      filename: 'crawler/logs/fetch.log',
      level: 'info'
    })]
});

module.exports.logger = logger;

module.exports.logFetchStart = id => {
  logger.info(FETCH_START_STR, id);
};

module.exports.logFetchEnd = (id, name, name_cn) => {
  logger.info(FETCH_END_STR, id, name, name_cn);
};
