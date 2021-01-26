// Get data of configuration.

const _ = require("lodash");
const config = require("../../config.json");
const env = process.env.NODE_ENV || "dev";
global.config = _.merge(config["dev"], config[env]);
const axios = require("axios");

// Logs commands
const shell = require("shelljs");
const ora = require("ora");
const { forEach } = require("lodash");

// Logs tool.
const logsOptions = require("../../util/logsOptions");
const { ShellString } = require("shelljs");

const Table = require("tty-table");

async function getServices() {

  //! Print spinner.
  let logsSpinner = ora("Search for cross connection between services").start();
  // Get variables from config.js
  let crossLogsResultsList = [];
  let colorTable = [];
  let passTestTable = true;
  let CROSS_LOGS = global.config.CROSS_LOGS;

  for (const key in CROSS_LOGS) {
    
    // ! Get variables.

    let cross_logs    = CROSS_LOGS[key];
    let INPUT_SERVICE = cross_logs.INPUT_SERVICE;
    let CHECK_SERVICE = cross_logs.CHECK_SERVICE;
    let SHELL_EXEC    = cross_logs.SHELL_EXEC;

    // ! Save logs before of exec SHELL_COMMAND:
    // Save logs of containers CHECK_SERVICE.

    logsConfigServiceBefore = {
      tag: "beforeCrossLogs",
      nameService: CHECK_SERVICE,
      addressSave: "./checkLogsHistory/",
      commandExec: "docker",
    };

    //? Improve Library. 
    

    // Save logs ...
    logsOptions.saveLog(logsConfigServiceBefore);

    // Save logs of containers INPUT_SERVICE.
    logsConfigInputBefore = {
      tag: "beforeCrossLogs",
      nameService: INPUT_SERVICE,
      addressSave: "./checkLogsHistory/",
      commandExec: "docker",
    };

    // Save logs ...
    logsOptions.saveLog(logsConfigInputBefore);

    //! Run shell commands:
    resultOfExec = await shell.exec(SHELL_EXEC, { silent: true });

    //! Load news Logs.
    logsConfigServiceAfter = {
      tag: "afterCrossLogs",
      nameService: CHECK_SERVICE,
      addressSave: "./checkLogsHistory/",
      commandExec: "docker",
    };

    // // Save logs ...
    await logsOptions.saveLog(logsConfigServiceAfter);

    logsConfigInputAfter = {
      tag: "afterCrossLogs",
      nameService: INPUT_SERVICE,
      addressSave: "./checkLogsHistory/",
      commandExec: "docker",
    };

    await logsOptions.saveLog(logsConfigInputAfter);

    //! Compare logs:
    resultInputLogs   = await logsOptions.compareLogs(logsConfigInputBefore, logsConfigInputAfter);
    resultServiceLogs = await logsOptions.compareLogs(logsConfigInputBefore, logsConfigInputAfter);

    var passCrossTest = false;
    //! Single results:
    if (!resultInputLogs || !resultServiceLogs) {
      passCrossTest = false;
      passTestTable = false;
    } else {
      passCrossTest = true;
      // Print Table with results.
    }

    //! Salve results inside to list.
    crossLogsResultsList.push({
      entryPoint: INPUT_SERVICE,
      endPoint: CHECK_SERVICE,
      changeEntryPoint: String(resultInputLogs),
      changeEndPoint: String(resultServiceLogs),
      ShellCommand: SHELL_EXEC,
      passTest: String(passCrossTest),
    });
  }

  //! Print Table if the results if fail.

  // Header:
  if (!passTestTable) {
    logsSpinner.fail();
    let header = [
      { value: "entryPoint", width: 25, alias: "Entry Point" },
      { value: "endPoint", width: 25, alias: "End Point" },
      { value: "changeEntryPoint", width: 20 },
      { value: "changeEndPoint", width: 20 },
      { value: "ShellCommand", width: 40, align: "rigth", alias: "Shell Command Used" },
      {
        alias: "Connection",
        value: "passTest",
        width: 15,
        color: "red",
        formatter: function (value) {
          if (value === "true") {
            value = this.style(value, "bgGreen", "black");
          } else {
            value = this.style(value, "bgRed", "white");
          }
          return value;
        },
      },
    ];
    const t3 = Table(header, crossLogsResultsList);
    console.log(t3.render());
  } else {
    logsSpinner.succeed();
  }

  return passCrossTest
}

module.exports.getServices = getServices;




