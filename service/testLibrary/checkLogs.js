const log = require("../../util/logger")("editionService");
const tc = require("timezonecomplete");
const shell = require("shelljs");
const _ = require("lodash");
const config = require("../../config.json");
const connetionCommand = require("../dictionary/connetionCommand.json");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const env = process.env.NODE_ENV || "dev";
const Table = require("tty-table");
const selectService = require("./selectService");
const fs = require("fs-extra");
const ora = require("ora");
// Logs opcion:


const clear = require("clear");
const { ConsoleTransportOptions } = require("winston/lib/winston/transports");
const getConfigVariable_ENV = require("../../util/getConfigVariable")


async function getBugs(logRow, service, results, detectLogBug) {
  var idRow = logRow.split("\n");
  let cont = -1;

  const {LOG_NUMBER_OF_LINE, LOG_KEYWORD} = getConfigVariable_ENV.ConfigCommands();
  let lineConfig = idRow.length - LOG_NUMBER_OF_LINE;


  // logHist = JSON.parse(logHist);
  // read historical

  for (let index = 0; index < idRow.length; index++) {
    cont = cont + 1;

    // get last number to lines.
    if (cont > lineConfig) {
      // Search error world.
      keyWorldError = LOG_KEYWORD;
      for (const key in keyWorldError) {
        bugWorld = idRow[index].search(keyWorldError[key]);

        // Search keyworld inside to log.
        
        
        if (bugWorld !== -1) {
          results.push({
            Service: service,
            Key_world: keyWorldError[key],
            Bug_number_line: cont,
            Bug_Log: idRow[index],
          });

          detectLogBug = true;
          log.warn(
            "LOGS CHECK : WAS DETECT KEYWORLD :" +
              keyWorldError[key] +
              " whith service :  " +
              service
          );
        }
      }
    }
  }
  return results;
}

async function searchBugInsideLog(serviceName) {
  
  //! Load configuration variable: 
  const { LOGS_ERROR_EXCEPTION } = await getConfigVariable_ENV.ConfigCommands()
  

  let data
  let results         = [];
  let DATA_HISTORICAL = [];
  let detectLogBug    = true;
   
  
  serviceName = ['edutelling-api'] // temp variable

  for (const key in serviceName) {

    let searchLogBug   = true;
    let service        = serviceName[key];
    var logRow = await exec(connetionCommand.docker.LOG + " " + service);

    //* Test
  
    log.info("Search Bugs inside to LOGS | Service name: " + service);
    
    // Init time variable
    let newDate = new Date();
    let datetimeStdErr = newDate;
    let datetimeStdOut = newDate;

    //! Check if exist file logs.  
    if (fs.existsSync('./checkLogsHistory/logsHist.json')) {
      // Add Json format
      var logHist = await fs.readFile("./checkLogsHistory/logsHist.json", "utf8");
      logHist = JSON.parse(logHist);
      log.info("Load historical logs : " + service);

    } else {
      log.info("Init historic logs file");
      var logHist = {
        DATA_HISTORICAL: [
          {
            service: service,
            stderr: logRow.stderr,
            datatimeStdErr: datetimeStdErr,
            stdout: logRow.stdout,
            datatimeStdOut: datetimeStdOut,
          },
        ],
      };
    }

    // compare new data with old register

    let newLogs = true;
    let newErr  = true;

    for (const key in logHist.DATA_HISTORICAL) {
      var oldLogs = logHist.DATA_HISTORICAL[key];

      //  select rigth value
      if (oldLogs.service === service) {
        // Compare data

        if (logRow.stderr === oldLogs.stderr) {
          newErr = false;
          datetimeStdErr = new Date(oldLogs.datatimeStdErr);
          log.info("| uHQyA7DQ | There are no changes in the Errors SERVICE: " + service);
          log.warn('LOGS OUT IS IGUAL TO OLD')

        }

        // Here is adding the logical and datetime when was given the logs.
        if (logRow.stdout === oldLogs.stdout) {
          log.warn('LOGS STD IS IGUAL TO OLD')
          newLogs = false;
          datetimeStdOut = new Date(oldLogs.datatimeStdOut);
          log.info("| 1SC6Qby | There are no changes in the LOGS SERVICE: " + service);
        }

      }
    }
    
    
    //! Get Exception:
    let isException     = false
    
     //? Search if exist exception.
    for (const key in LOGS_ERROR_EXCEPTION){

      let logsErrorException = LOGS_ERROR_EXCEPTION[key]
      isStdout = logRow.stdout.includes(logsErrorException);
      isStderr = logRow.stderr.includes(logsErrorException);
      
      if (isStderr || isStdout) {
        isException = true
      }
      
    }
    
    if (!isException) {
    // Add data to History list
    
    DATA_HISTORICAL.push({
      service: service,
      stderr: logRow.stderr,
      datatimeStdErr: datetimeStdErr,
      stdout: logRow.stdout,
      datatimeStdOut: datetimeStdOut,
    });
   
    // Apply rules.
    // datetimeStdOut > datetimeStdErr > no new cases
    // datetimeStdOut < datetimeStdErr > there are new cases

    data = {
      DATA_HISTORICAL: DATA_HISTORICAL,
    };
    
    var serachLogBugInsideToStdout = false;

    if (newLogs && !newErr) {
      searchLogBug = false;
      serachLogBugInsideToStdout = true;
      log.info(
        " (1) Was select the criterial: newLogs===true and newError===false (DISABLED SERACH LOGS) SERVICE: " +
          service
      );
    }
    
    if (!newLogs && !newErr) {
      searchLogBug = true;
      log.info(
        " (2) Was select the criterial: newLogs===false and newError===false (IS ACTIVE SERACH LOGS) SERVICE: " +
          service
      );
    }

    if (!newLogs && !newErr && datetimeStdOut > datetimeStdErr) {
      searchLogBug = false;
      serachLogBugInsideToStdout = true;
      log.info(
        " (3) Was select the criterial: newLogs===false and newError===false and datetimeStdOut > datetimeStdErr (DISABLED SERACH LOGS) SERVICE " +
          +service
      );
    }

    if (!newLogs && !newErr && datetimeStdOut > datetimeStdErr) {
      searchLogBug = false;
      serachLogBugInsideToStdout = true;
      log.info(
        " (4) Was select the criterial: newLogs===false and newError===false and datetimeStdOut > datetimeStdErr (DISABLED SERACH LOGS) SERVICE " +
          +service
      );
    }

    if (searchLogBug) {
      // historial
      logRowCompact = logRow.stdout + logRow.stderr;
      logRowCompact = logRow.stde
      console.log(logRowCompact)
      results = await getBugs(logRowCompact, service, results, detectLogBug);
    }
    if (serachLogBugInsideToStdout) {
      logRow = logRow.stdout;
      results = await getBugs(logRow, service, results, detectLogBug);
    }


    let dataErrJson = JSON.stringify(data, null, 2);
    fs.writeFile("./checkLogsHistory/logsHist.json", dataErrJson, "utf8");

  } else {
    log.warn('WAS DETECT ONE EXCEPTION.')
  }



}

  return [detectLogBug, results];
}

async function getLogsCommand() {

  //! GET CONFIGURATION: 
  const {MODE_CONNECT, SERVICES_NAME} = await getConfigVariable_ENV.ConfigCommands()

  if (MODE_CONNECT === "manual") {
    servicesaddress = SERVICES_NAME;
  }

  if (MODE_CONNECT === "docker") {
    let serviceName = await selectService.getIp();

    // Get logs test resutls
    // results = await searchBugInsideLog(serviceName);
    passTest = await searchLogsErr(serviceName)
    
  }

  if (MODE_CONNECT === "kubectl") {
    var servicesaddress = shell.exec(connetionCommand.docker.LOG + " " + serviceName, {
      silent: true,
    });
    servicesaddress = servicesaddress.stdout;
  }
  return results;
}

async function check() {

  // var serviceName = 'functional-test'
  var results = await getLogsCommand();
  
  var detectLogBug = results[0];
  results = results[1];
  
  let testSuccess
  //! Print Spinner
  let logsS = ora("Verify results of logs of your services").start();
  if (results.length !== 0) {
    logsS.fail();
    testSuccess = false
  } else {
    logsS.succeed();
    testSuccess = true
  }

  //! Print Table.
  if (results.length !== 0) {
    const header = [
      {
        value: "Service",
        width: 30,
        alias: "Service Name",
      },
      {
        value: "Key_world",
        width: 20,
        alias: "Key word",
      },
      {
        value: "Bug_number_line",
        width: 20,
        alias: "Line number",
      },
      {
        value: "Bug_Log",
        align: "left",
        width: 50,
        alias: "Fault logs found",
      },
    ];

    reportLog.logsTest.table.results = results;

    const t3 = Table(header, results);

  }
  reportLog.logsTest.table.plot = true;
  return testSuccess;
}

async function getServuciceName() {
  let services = await selectService.getPort();
  results = await checkMultiService(services);
  return results;
}

// Improve method for get logs error of simple way. 

async function detectOnlyStdErrInsideToLogs(dataBeforeToStart, curlTestList, dataInit) {

  //TODO add control for kubernetes. 
   
  let serviceName = await selectService.getIp();
  
  outputData = []
  var passLogsTest 
  for (const key in serviceName) {

    let service     = serviceName[key]
    let logsSpinner = ora("Check Endpoint : " + service + " | " + '[' + dataInit.apiVerbs+ '] ' + dataInit.path).start();
    
    var logs = await exec(connetionCommand.docker.LOG + " --since " + dataBeforeToStart + " " + service);
    var err  = logs.stderr
    
    if(err === "") {
      passLogsTest = true
      logsSpinner.succeed();
    } else {
      passLogsTest = false
      logsSpinner.fail();
    }
    
    data = {
      'serviceName': service, 
      'stdErr': err.substr(0,600) + ' ...',
      'passLogsTest': passLogsTest
    }
    
    outputData.push(data)

  }

  return outputData

}


async function searchLogsErr(dataBeforeToStart) { 


  //! 1. Get commands for execute and read logs. 
  let serviceName  = await selectService.getIp();
  var passLogsTest = false  
  var outputTest   = []
  var passTest = true

  for (const key in serviceName) {

    let service = serviceName[key]
    
    //! 6. Use spinners inside to logic. 
    let logsSpinner = ora("Check Log of the service : " + service).start();

    //! 2. Execute commands use dataTimeLimit
    var commandLog = connetionCommand.docker.LOG + " --since " + dataBeforeToStart + " " + service
    var logs       = await exec(commandLog);

    //! 3. Get results. 
    var err = logs.stderr

    //! 4. Control if exist strOut inside to response testPass = false. 
    if(err === "") {
      passLogsTest = "true"
      logsSpinner.succeed();
    } else {
      passLogsTest = "false"
      logsSpinner.fail();
      passTest = false
    }
    
    let data = {
      serviceName: service, 
      command: commandLog, 
      logErr: err.substr(0,1000) + " ...",
      passTest: passLogsTest
    }
    outputTest.push(data)
  }


  //! 5. Print results how table. 
  if (!passTest) {
    
    let header = [
      
      {value: "serviceName", alias: "Service Name", align: "left", width: 30},
      {value: "command", alias: "Command", align: "left", width: 60},
      {value: "logErr", alias: "logErr", align: "left", width: 80},
      {
        alias: "Success", value: "passTest",
        width: 10, color: "red",
        formatter: function (value) {
          if (value === "true") {
            value = this.style(value, "bgGreen", "black");
          } else {
            value = this.style(value, "bgRed", "white");
          }
          return value;
        },
      },
    ]

    const t3 = Table(header, outputTest)
    console.log(t3.render())
  }
  
  return passTest

}


module.exports.detectOnlyStdErrInsideToLogs = detectOnlyStdErrInsideToLogs;
module.exports.getLogsCommand = getLogsCommand;
module.exports.check = check;
module.exports.searchLogsErr = searchLogsErr;