const _ = require("lodash");
const log = require("./logger")("editionService");
const config = require("../config.json");
const env = process.env.NODE_ENV || "dev";
const { Console } = require("winston/lib/winston/transports");
global.config = _.merge(config["dev"], config[env]);


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

  if (ZIPI_CONFIGURATION === "env_variable"){
  
    MODE_CONNECT         = process.env.MODE_CONNECT || "docker";
    WAIT_TIME_SECONDS    = process.env.WAIT_TIME_SECONDS || 10;
    RETRIES_NUMBER       = process.env.RETRIES_NUMBER || 3;
    TO_BREAK_PIPELINE    = process.env.TO_BREAK_PIPELINE || true;  
    SMOKE_TEST_CRITERIA  = process.env.SMOKE_TEST_CRITERIA || "SERVICE_AVAILABILITY";  
    LOGS_ERROR_EXCEPTION = process.env.LOGS_ERROR_EXCEPTION || [""];
    ENDPOINT_HOST        = process.env.ENDPOINT_HOST || "";
    SERVICES_NAME        = process.env.SERVICES_NAME || "";
    
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
   
   }
  

  var configVariables = {
   "MODE_CONNECT": MODE_CONNECT, 
   "WAIT_TIME_SECONDS": WAIT_TIME_SECONDS,
   "RETRIES_NUMBER": RETRIES_NUMBER,
   "TO_BREAK_PIPELINE": TO_BREAK_PIPELINE,
   "SMOKE_TEST_CRITERIA": SMOKE_TEST_CRITERIA,
   "LOGS_ERROR_EXCEPTION": LOGS_ERROR_EXCEPTION,
   "ENDPOINT_HOST": ENDPOINT_HOST,
   "SERVICES_NAME": SERVICES_NAME,
  }

  return configVariables;
}

module.exports.ConfigCommands = ConfigCommands;

// const getConfigVariable_ENV = require("../../util/getConfigVariable")
// const {MODE_CONNECT} = await getConfigVariable_ENV.ConfigCommands()