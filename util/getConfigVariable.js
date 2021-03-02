const _ = require("lodash");
const config = require("../config.json");
const env = process.env.NODE_ENV || "dev";
const { Console } = require("winston/lib/winston/transports");
global.config = _.merge(config["dev"], config[env]);

// const getConfigVariable_ENV = require('../../util/getConfigVariable');


async function ConfigCommands() {
  
  //! GET CONFIGURATION: 
  const ZIPI_CONFIGURATION = process.env.ZIPI_CONFIGURATION || "config_file";

  //* Define variable
  var MODE_CONNECT
  var WAIT_TIME_SECONDS
  var RETRIES_NUMBER
  var TO_BREAK_PIPELINE
  var SMOKE_TEST_CRITERIA
  var LOGS_ERROR_EXCEPTION
  var ENDPOINT_HOST
  var SERVICES_NAME
  var LOGS_ERROR_EXCEPTION
  var LOG_NUMBER_OF_LINE
  var LOG_KEYWORD
  var CLEAN_LOGS_REPORTS_NUMBER
  var MONITORING_TIME
  var SMOKE_TEST_SERVICE_NAME
  var ENDPOINT_SWAGGER_PAGE
  var ENDPOINT_SCANN_SWAGGER_FROM
  var ENDPOINT_GET_TOKEN


  if (ZIPI_CONFIGURATION === "env_variable"){
  
    MODE_CONNECT         = process.env.MODE_CONNECT || "docker";
    WAIT_TIME_SECONDS    = process.env.WAIT_TIME_SECONDS || 10;
    RETRIES_NUMBER       = process.env.RETRIES_NUMBER || 3;
    TO_BREAK_PIPELINE    = process.env.TO_BREAK_PIPELINE || true;  
    SMOKE_TEST_CRITERIA  = process.env.SMOKE_TEST_CRITERIA || "Everything_Up";  
    LOGS_ERROR_EXCEPTION = process.env.LOGS_ERROR_EXCEPTION || [""];
    ENDPOINT_HOST        = process.env.ENDPOINT_HOST || "";
    SERVICES_NAME        = process.env.SERVICES_NAME || "";
    LOG_NUMBER_OF_LINE   = process.env.LOG_NUMBER_OF_LINE || 6;
    LOG_KEYWORD               = process.env.LOG_KEYWORD || [];
    CLEAN_LOGS_REPORTS_NUMBER = process.env.CLEAN_LOGS_REPORTS_NUMBER || 4;
    MONITORING_TIME           = process.env.MONITORING_TIME || 10;
    ENDPOINT_SWAGGER_PAGE     = process.env.ENDPOINT_SWAGGER_PAGE || "";
    ENDPOINT_SCANN_SWAGGER_FROM = process.env.ENDPOINT_SCANN_SWAGGER_FROM || "";
    ENDPOINT_GET_TOKEN    = process.env.ENDPOINT_GET_TOKEN || "";
    //* Pase variables.  
    RETRIES_NUMBER       = parseInt(RETRIES_NUMBER)
    WAIT_TIME_SECONDS    = parseInt(WAIT_TIME_SECONDS)
    LOGS_ERROR_EXCEPTION = eval(LOGS_ERROR_EXCEPTION)
    SERVICES_NAME        = eval(SERVICES_NAME)

  } else {

    MODE_CONNECT         = global.config.MODE_CONNECT  
    WAIT_TIME_SECONDS    = global.config.WAIT_TIME_SECONDS
    RETRIES_NUMBER       = global.config.RETRIES_NUMBER
    TO_BREAK_PIPELINE    = global.config.TO_BREAK_PIPELINE
    LOGS_ERROR_EXCEPTION = global.config.LOGS_ERROR_EXCEPTION
    ENDPOINT_HOST        = global.config.ENDPOINT_HOST
    SERVICES_NAME        = global.config.SERVICES_NAME
    LOG_NUMBER_OF_LINE   = global.config.LOG_NUMBER_OF_LINE;
    LOG_KEYWORD               = global.config.LOG_KEYWORD;
    CLEAN_LOGS_REPORTS_NUMBER = global.config.CLEAN_LOGS_REPORTS_NUMBER || 4;
    MONITORING_TIME           = global.config.MONITORING_TIME;
    ENDPOINT_SWAGGER_PAGE   = global.config.ENDPOINT_SWAGGER_PAGE || "";
    ENDPOINT_SCANN_SWAGGER_FROM = global.config.ENDPOINT_SCANN_SWAGGER_FROM || "";
    ENDPOINT_GET_TOKEN = global.config.ENDPOINT_GET_TOKEN || "";

   }
  
   SMOKE_TEST_SERVICE_NAME = 'smoke-test'

  var configVariables = {
    "MODE_CONNECT": MODE_CONNECT, 
    "WAIT_TIME_SECONDS": WAIT_TIME_SECONDS,
    "RETRIES_NUMBER": RETRIES_NUMBER,
    "TO_BREAK_PIPELINE": TO_BREAK_PIPELINE,
    "SMOKE_TEST_CRITERIA": SMOKE_TEST_CRITERIA,
    "LOGS_ERROR_EXCEPTION": LOGS_ERROR_EXCEPTION,
    "ENDPOINT_HOST": ENDPOINT_HOST,
    "SERVICES_NAME": SERVICES_NAME,
    "LOG_NUMBER_OF_LINE": LOG_NUMBER_OF_LINE,
    "LOG_KEYWORD": LOG_KEYWORD,
    "CLEAN_LOGS_REPORTS_NUMBER": CLEAN_LOGS_REPORTS_NUMBER,
    "MONITORING_TIME": MONITORING_TIME, 
    "SMOKE_TEST_SERVICE_NAME": SMOKE_TEST_SERVICE_NAME,
    "ENDPOINT_SWAGGER_PAGE": ENDPOINT_SWAGGER_PAGE,
    "ENDPOINT_SCANN_SWAGGER_FROM": ENDPOINT_SCANN_SWAGGER_FROM,
    "ENDPOINT_GET_TOKEN": ENDPOINT_GET_TOKEN,
  }
  
  return configVariables;
}

module.exports.ConfigCommands = ConfigCommands;
