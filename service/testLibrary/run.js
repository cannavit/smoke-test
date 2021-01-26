let selectTest     = require("../dictionary/testByCriteria.json");
const _            = require("lodash");
const env          = process.env.NODE_ENV || "dev";
const config       = require("../../config.json");
global.config      = _.merge(config["dev"], config[env]);
const testCases    = global.config.SMOKE_TEST_CRITERIA;
const isNumber     = require('is-number');

// RUN CASES


const tcp          = require("./ping");
const checkLogs    = require("./checkLogs");
const serviceUp    = require("./servicesUp");
const tc           = require("timezonecomplete");
const scannSwagger = require('../../util/scannSwagger')

const endpoint     = require("./endpoint");
const crossLogs    = require("./crossLogs");

// LOGS

const log          = require("../../util/logger");
const Table        = require("tty-table");
var colors         = require('colors');
const sleep        = require('sleep-promise');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const shell        = require("shelljs");
const fs           = require("fs-extra");
const path         = require('path');
const util         = require('util');
const readdirAsync = util.promisify(fs.readdir);
const statAsync    = util.promisify(fs.stat);

const getConfigVariable_ENV = require("../../util/getConfigVariable")

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
  
  //! Clean files: 
  if (count > CLEAN_LOGS_REPORTS_NUMBER){
    let deleteFileNo =   count - CLEAN_LOGS_REPORTS_NUMBER 
    for (const key in directoryPath) {
      let fileLog = directoryPath[key]
      if (key < deleteFileNo) {
        fs.unlinkSync(pathControl + '/' + fileLog)
      }
    }
  } 

  return monitoringName

}

//! Use the child service.
// Read name of file report. 
const logsOption = require('../../util/logsOptions')
const { fork }   = require('child_process');

async function smktests() {

  //! LOAD CONFIG PARAMS.

  const { RETRIES_NUMBER } = await getConfigVariable_ENV.ConfigCommands()

  let dataBeforeToStart = new Date().toISOString() //* Init time of test. 
  
  let RUN_SMOKE_TEST      = true  
  let PASS_TEST           = false
  
  let pathControl         = './logs/TEST' 
  let monitoringName      = '0_smokeTestResult.csv' 
  let searchWorld         = 'Test'
  let nameToFileForCreate = '_out_monitoring.csv'
  
  var forked              = fork('./util/monitoring')

  let COUNT_TRY_SMOKE_TEST_RUN = 0
  
  let name =  await logsOption.getNameForGenerateLog(pathControl, monitoringName , searchWorld, nameToFileForCreate)
  var nameOfTestLogs = name.substr(0, name.search('_')) + '_smokeTestResult_tryNo_'+ COUNT_TRY_SMOKE_TEST_RUN
  
  //! Init monitoring.js
  console.log(colors.bgGreen('Start Monitoring resources now!'));
  forked.send({startOfMonitoring : true, "nameOfreport": name, "nameOfTestLogs": nameOfTestLogs });
  fs.writeFileSync("util/stop.tmp", "false");
  

  //! Wait for the test
  
  const { WAIT_TIME_SECONDS } = await getConfigVariable_ENV.ConfigCommands()
  await sleep(WAIT_TIME_SECONDS*1000);
    
  var start = new tc.nowUtc();

  // Monitoring resources 

  while (RUN_SMOKE_TEST) {

    console.log(colors.bgCyan('WAIT PLEASE! , Collection of metrics before to continue with the test...'));
    console.log(colors.bgMagenta('Start with the SmokeTest..'));
    console.log(colors.bgGreen('EntryPoint Families Execution Test :'));

    //! Add data:
    
    let ping_tcp_success            = 'DISABLED'
    let log_check_success           = 'DISABLED'
    let service_up_success          = 'DISABLED'
    let endpoint_connection_success = 'DISABLED'
    let cross_logs_success          = 'DISABLED'
    let active_all_endPoints        = 'DISABLED'

    //! Start test.
    if ((selectTest[testCases].PING_TCP_NETWORK || false)) {
        let results = await tcp.checkNetwork();
        ping_tcp_success = results.successPing
    }

    //! Test name: SERVICES_UP 
    if ((selectTest[testCases].SERVICES_UP || false)) {
      let { servicesDisabled  }  = await serviceUp.status();
      
      { servicesDisabled }
      service_up_success = !servicesDisabled.detectWord
    
    }
    //! Test name: ACTIVATE_ENDPOINT
    if ((selectTest[testCases].ACTIVATE_ENDPOINT || false)) {
      passTestEndpoint =  await endpoint.check();
      endpoint_connection_success = passTestEndpoint
    }
    
    // TODO add cross logs
    
    //? ---------------------------------------------------------------------------------------------
    //! Apply criterial CROSS_LOGS: Test ...
    //? ---------------------------------------------------------------------------------------------
    if ((selectTest[testCases].CROSS_LOGS || false)) {
      let passCrossLogsTest = await crossLogs.getServices();
      cross_logs_success = passCrossLogsTest
    }
    
    
    //? ---------------------------------------------------------------------------------------------
    //! Apply criterial ACTIVATE_ALL_ENDPOINT: Test ...
    //? ---------------------------------------------------------------------------------------------
    if ((selectTest[testCases].ACTIVATE_ALL_ENDPOINT || false)) { 
      active_all_endPoints = await scannSwagger.executeTestCurl()
    }
      
    //? ---------------------------------------------------------------------------------------------
    //! Apply criterial LOG_CHECK: Test ...
    //? ---------------------------------------------------------------------------------------------
    if ((selectTest[testCases].LOG_CHECK || false)) {
      // Plot init test...
      let passTestLogCheck = await checkLogs.searchLogsErr(dataBeforeToStart)
      log_check_success = passTestLogCheck
    }  

    //? Get duration of Tests.
      
    var end = new tc.nowUtc();
    var duration = end.diff(start);
    duration = duration.seconds();

    //! Repit test in case of fail
    let passTest = false

    console.log(ping_tcp_success) 
    console.log(log_check_success) 
    console.log(service_up_success) 
    console.log(endpoint_connection_success) 
    console.log(cross_logs_success)

    if ( ( ping_tcp_success           || ping_tcp_success  === 'DISABLED')  &&
        ( log_check_success           || log_check_success === 'DISABLED')  &&
        ( service_up_success          || service_up_success === 'DISABLED') && 
        ( active_all_endPoints        || active_all_endPoints === 'DISABLED' ) && 
        ( cross_logs_success          || cross_logs_success === 'DISABLED')) {
      
          passTest = true
    }

    if (!ping_tcp_success || !log_check_success || !service_up_success || !endpoint_connection_success || !cross_logs_success || !active_all_endPoints) {
      
      COUNT_TRY_SMOKE_TEST_RUN = COUNT_TRY_SMOKE_TEST_RUN + 1
      

      if (COUNT_TRY_SMOKE_TEST_RUN > RETRIES_NUMBER) {
        RUN_SMOKE_TEST = false    
        PASS_TEST = true
      } 

    } else {
      RUN_SMOKE_TEST = false  
    }
    

    //! Get data from monitoring.js
    forked.on('message', (msg) => {
      
        msg.smokeTestResults = {
              criterial:  global.config.SMOKE_TEST_CRITERIA,
              pingTcp:    ping_tcp_success,
              logCheck:   log_check_success,
              upService:  service_up_success,
              endpoints:  endpoint_connection_success,
              crossLogs:  cross_logs_success,
              allEndpoints: active_all_endPoints,
              testTime:   duration, 
              passTest: passTest
        }
        
        
        let oldDataRow

        try {
          let rawdata = fs.readFileSync('./logs/TEST/smokeTestResults.json');
          oldDataRow = JSON.parse(rawdata);
        } catch (error) {
          oldDataRow = []              
        }
        
        oldDataRow.push(msg)
        
        let data = JSON.stringify(oldDataRow);

        fs.writeFileSync('./logs/TEST/smokeTestResults.json' , data);
        
    });

    //
 
  }
  
  // await sleep(5000);
  fs.writeFileSync("util/stop.tmp", "true");
  forked.send({startOfMonitoring : false, nameOfreport: name, nameOfTestLogs: nameOfTestLogs }) 
  
  
  return PASS_TEST

}

module.exports.smktests = smktests;