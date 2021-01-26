// FIXME Create one signle ultils file for this services.

// ! To declare library
const connetionCommand = require("../service/dictionary/connetionCommand.json");
const getCommand = require("../service/dictionary/getCommand");
const shell = require("shelljs");
const fs = require("fs-extra");
const { log } = require("winston");
const util = require('util');
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const path = require('path');
const isNumber = require('is-number');

async function readdirChronoSorted(dirpath, order) {
  order = order || 1;
  const files = await readdirAsync(dirpath);
  const stats = await Promise.all(
    files.map((filename) =>
      statAsync(path.join(dirpath, filename))
        .then((stat) => ({ filename, stat }))
    )
  );
  return stats.sort((a, b) =>
    order * (b.stat.mtime.getTime() - a.stat.mtime.getTime())
  ).map((stat) => stat.filename);
}

(async () => {
  try {
    const dirpath = path.join(__dirname);
  } catch (err) {
    console.log(err);
  }
})();


async function getNameForGenerateLog(pathControl, monitoringName , serachWorld, nameToFileForCreate) {

  CLEAN_LOGS_REPORTS_NUMBER = global.config.CLEAN_LOGS_REPORTS_NUMBER || 4
  let directoryPath = await readdirChronoSorted(pathControl, -1) 
  let count = 0
  
  for (const key in directoryPath) {
    let fileLog = directoryPath[key]
    if (fileLog.includes(serachWorld)){
      count = count + 1
      
      fileLogNumber = fileLog.substr(0,fileLog.search('_'))
 
      if (isNumber(fileLogNumber)) {
        monitoringName = (Number(fileLogNumber) + 1 ) + nameToFileForCreate 
      } else {
        monitoringName = count + nameToFileForCreate
      }
      
    }
  }
  
 // //! Clean files: 
  //if (count > CLEAN_LOGS_REPORTS_NUMBER){
    //let deleteFileNo =   count - CLEAN_LOGS_REPORTS_NUMBER 
    //for (const key in directoryPath) {
      //let fileLog = directoryPath[key]
      //if (key < deleteFileNo) {
        //fs.unlinkSync(pathControl + '/' + fileLog)
      //}
    //}
  //} 

  return monitoringName

}

module.exports.getNameForGenerateLog = getNameForGenerateLog;

// Get logs and seve results in one file JSON.
async function saveLog(logsConfig) {
  // ! Params description:

  /**
   *  @param:  logsConfig = {
                        tag: "beforeCrossLogs",
                        nameService: "edutelling-api",
                        addressSave: ".",
                        commandExec: "docker",
                             }
   */

  // ! Build the commands for eval Logs

  let commandLog = connetionCommand[logsConfig.commandExec].LOG + " " + logsConfig.nameService;

  // ! Eval commands

  var getLog = await shell.exec(commandLog, { silent: true });
  let allLogs = getLog.stdout + getLog.stderr;

  // ! Save all Logs.

  let nameLogFile = logsConfig.addressSave + logsConfig.nameService + "_" + logsConfig.tag + ".json";
  let dataOutputLogsJson = JSON.stringify({ dataLogs: allLogs }, null, 2);
  fs.writeFile(nameLogFile, dataOutputLogsJson, "utf8");
}

module.exports.saveLog = saveLog;

// Read logs saved.

async function readLog(logsConfig) {
  // ! Name for read json
  let nameLogFile = logsConfig.addressSave + logsConfig.nameService + "_" + logsConfig.tag + ".json";
  // Get json
  var logResult = await fs.readFile(nameLogFile, "utf8");
  try {
    logResult = JSON.parse(logResult);
  } catch (error) {
    let t = error;
    
  }

  return logResult;
}

module.exports.readLog = readLog;

// Compare the logs.

async function compareLogs(logsConfig, logsConfig2) {
  // Get logs..
  let log1 = await readLog(logsConfig);
  log1 = log1.dataLogs;
  // Get logs...
  let log2 = await readLog(logsConfig2);
  log2 = log2.dataLogs;

  let differentLogs = false;
  if (log1 !== log2) {
    differentLogs = true;
  }

  return differentLogs;
}

module.exports.compareLogs = compareLogs;
