// logger
const winston = require("winston");
const _ = require("lodash");
const env = process.env.NODE_ENV || "dev";
let config = require("../config.json");

const createLogger = function (label) {
  return winston.createLogger({
    transports: [
   //  new winston.transports.Console(),
      new winston.transports.File({ filename: "logs/resources.log" }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label: label }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, label, message }) => {
        return `${timestamp} [${level}] ${label} ${message}`;
      })
    ),
  });
};



const logger = function (label) {
  let logger = createLogger(label);
  return {
    debug: function (text) {
      var textClone = JSON.parse(JSON.stringify(text));
      logger.debug(textClone);
    },
    info: function (text) {
      var textClone = JSON.parse(JSON.stringify(text));
      logger.info(textClone);
    },
    error: function (text) {
      var textClone = JSON.parse(JSON.stringify(text));
      logger.error(textClone);
    },
    warn: function (text) {
      var textClone = JSON.parse(JSON.stringify(text));
      logger.warn(textClone);
    },
  };
};

module.exports = logger;
