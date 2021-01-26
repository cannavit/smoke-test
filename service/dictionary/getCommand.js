const _ = require("lodash");
const log = require("../../util/logger")("editionService");
const config = require("../../config.json");
const env = process.env.NODE_ENV || "dev";
const shell = require("shelljs");
const connectionCommand = require("../../service/dictionary/connetionCommand.json");
const { Console } = require("winston/lib/winston/transports");
global.config = _.merge(config["dev"], config[env]);

const getConfigVariable_ENV = require("../../util/getConfigVariable")

async function evalCommand(nameToCommand) {

  log.info("EVAL OF COMMAND: ", nameToCommand);
  
  const {MODE_CONNECT} = await getConfigVariable_ENV.ConfigCommands()
   
  let command = connectionCommand[MODE_CONNECT][nameToCommand];

  var servicesaddress = shell.exec(command, { silent: true });

  return servicesaddress;
}

module.exports.evalCommand = evalCommand;

async function getListResutls(nameToCommand) {

  var dataMonitoring = await evalCommand(nameToCommand);
  
  var data = dataMonitoring.stdout;
 
  data = eval("[" + data.substr(0, data.length - 1) + "]");
  return data;
}

// async serachWorld()
module.exports.evalCommand = evalCommand;

async function searchInOutput(nameToCommand, world) {
  
  //! Detect number of list is smoketest service container. 
  //? Remove name of smoke-test service:
  let smokeTestContainerName = global.config.project.name
  let listOutputService = await getListResutls('SERVICE', { silent: true });
  let serviceSmokeTestIdList
  let count = -1 
  for (const key in listOutputService) {
    count = count + 1
    nameService = listOutputService[key]
    
    if(nameService === smokeTestContainerName) {
       serviceSmokeTestIdList = count
    }
    
  }
  
  let listOutput = await getListResutls(nameToCommand, { silent: true });

  let detectWord = false;
  let wordLine = "";
  count = -1 
  for (const key in listOutput) {
    count = count + 1
    let element = listOutput[key];

    if (element.search(world) != -1 && count != serviceSmokeTestIdList) {
      detectWord = true;
      wordLine = element;
    }
  }

  return { detectWord, wordLine, listOutput };
}

module.exports.getListResutls = getListResutls;
module.exports.searchInOutput = searchInOutput;
