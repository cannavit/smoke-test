let selectTest = require("../dictionary/testByCriteria.json");
const _ = require("lodash");
const isNumber = require("is-number");

// RUN CASES:
const tcp = require("./ping");
const checkLogs = require("./checkLogs");
const serviceUp = require("./servicesUp");
const tc = require("timezonecomplete");
const scannSwagger = require("../../util/scannSwagger");

const endpoint = require("./endpoint");
const crossLogs2 = require("./crossLogs");

// LOGS
const log = require("../../util/logger");
const Table = require("tty-table");
var colors = require("colors");
const sleep = require("sleep-promise");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const shell = require("shelljs");
const fs = require("fs-extra");
const path = require("path");
const util = require("util");
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);

const getConfigVariable_ENV = require("../../util/getConfigVariable");

async function readdirChronoSorted(dirpath, order) {
  order = order || 1;
  const files = await readdirAsync(dirpath);
  const stats = await Promise.all(
    files.map((filename) =>
      statAsync(path.join(dirpath, filename)).then((stat) => ({
        filename,
        stat,
      }))
    )
  );
  return stats
    .sort((a, b) => order * (b.stat.mtime.getTime() - a.stat.mtime.getTime()))
    .map((stat) => stat.filename);
}

(async () => {
  try {
    const dirpath = path.join(__dirname);
  } catch (err) {
    console.log(err);
  }
})();

async function getNameForGenerateLog(
  pathControl,
  monitoringName,
  serachWorld,
  nameToFileForCreate
) {
  const { CLEAN_LOGS_REPORTS_NUMBER } = getConfigVariable_ENV.ConfigCommands();

  let directoryPath = await readdirChronoSorted(pathControl, -1);
  let count = 0;

  const { SMOKE_TEST_CRITERIA } = await getConfigVariable_ENV.ConfigCommands();

  console.log(" SELECT CRITERIAL :", SMOKE_TEST_CRITERIA);

  for (const key in directoryPath) {
    let fileLog = directoryPath[key];
    if (fileLog.includes(serachWorld)) {
      count = count + 1;

      fileLogNumber = fileLog.substr(0, fileLog.search("_"));

      if (isNumber(fileLogNumber)) {
        monitoringName = Number(fileLogNumber) + 1 + nameToFileForCreate;
      } else {
        monitoringName = count + nameToFileForCreate;
      }
    }
  }

  //! Clean files:
  if (count > CLEAN_LOGS_REPORTS_NUMBER) {
    let deleteFileNo = count - CLEAN_LOGS_REPORTS_NUMBER;
    for (const key in directoryPath) {
      let fileLog = directoryPath[key];
      if (key < deleteFileNo) {
        fs.unlinkSync(pathControl + "/" + fileLog);
      }
    }
  }

  return monitoringName;
}

//! Use the child service.
// Read name of file report.
const logsOption = require("../../util/logsOptions");
const { fork } = require("child_process");
const { ConsoleTransportOptions } = require("winston/lib/winston/transports");

async function smktests() {
  //! LOAD CONFIG PARAMS.

  const { RETRIES_NUMBER, SMOKE_TEST_CRITERIA } =
    await getConfigVariable_ENV.ConfigCommands();

  let dataBeforeToStart = new Date().toISOString(); //* Init time of test.

  let RUN_SMOKE_TEST = true;
  let PASS_TEST = false;

  let pathControl = "./logs/TEST";
  let monitoringName = "0_smokeTestResult.csv";
  let searchWorld = "Test";
  let nameToFileForCreate = "_out_monitoring.csv";

  // var forked = fork("./util/monitoring");

  let COUNT_TRY_SMOKE_TEST_RUN = 0;

  let name = await logsOption.getNameForGenerateLog(
    pathControl,
    monitoringName,
    searchWorld,
    nameToFileForCreate
  );
  var nameOfTestLogs =
    name.substr(0, name.search("_")) +
    "_smokeTestResult_tryNo_" +
    COUNT_TRY_SMOKE_TEST_RUN;

  //! Init monitoring.js
  console.log(colors.bgGreen("Start Monitoring resources now!"));
  // forked.send({
  //   startOfMonitoring: true,
  //   nameOfreport: name,
  //   nameOfTestLogs: nameOfTestLogs,
  // });

  // fs.writeFileSync("util/stop.tmp", "false");

  //! Wait for the test

  const { WAIT_TIME_SECONDS } = await getConfigVariable_ENV.ConfigCommands();
  await sleep(WAIT_TIME_SECONDS * 1000);

  var start = new tc.nowUtc();

  // Monitoring resources

  while (RUN_SMOKE_TEST) {
    console.log(
      colors.bgCyan(
        "WAIT PLEASE! , Collection of metrics before to continue with the test..."
      )
    );
    console.log(colors.bgMagenta("Start with the SmokeTest.."));
    console.log(colors.bgGreen("EntryPoint Families Execution Test :"));

    //! Add data:
    let pingTcp = "DISABLED";
    let logCheck = "DISABLED";
    let upService = "DISABLED";
    let endpoints = "DISABLED";
    let crossLogs = "DISABLED";
    let active_all_endPoints = "DISABLED";

    //! Test name: ACTIVATE_ENDPOINT
    console.log("SMOKE_TEST_CRITERIA :", SMOKE_TEST_CRITERIA);
    console.log("000 ", selectTest[SMOKE_TEST_CRITERIA]);
    console.log(
      "----- -- :: ",
      selectTest[SMOKE_TEST_CRITERIA].ACTIVATE_ENDPOINT
    );

    //! Start test.
    if (selectTest[SMOKE_TEST_CRITERIA].PING_TCP_NETWORK || false) {
      let results = await tcp.checkNetwork();
      pingTcp = results.successPing;
    }

    //! Test name: SERVICES_UP
    if (selectTest[SMOKE_TEST_CRITERIA].SERVICES_UP || false) {
      let { servicesDisabled } = await serviceUp.status();
      upService = !servicesDisabled.detectWord;
    }

    if (selectTest[SMOKE_TEST_CRITERIA].ACTIVATE_ENDPOINT || false) {
      passTestEndpoint = await endpoint.check();

      endpoints = passTestEndpoint;
    }

    // TODO add cross logs

    //? ---------------------------------------------------------------------------------------------
    //! Apply criterial CROSS_LOGS: Test ...
    //? ---------------------------------------------------------------------------------------------
    if (selectTest[SMOKE_TEST_CRITERIA].CROSS_LOGS || false) {
      let passCrossLogsTest = await crossLogs2.getServices();
      crossLogs = passCrossLogsTest;
    }

    //? ---------------------------------------------------------------------------------------------
    //! Apply criterial ACTIVATE_ALL_ENDPOINT: Test ...
    //? ---------------------------------------------------------------------------------------------
    if (selectTest[SMOKE_TEST_CRITERIA].ACTIVATE_ALL_ENDPOINT || false) {
      active_all_endPoints = await scannSwagger.executeTestCurl();
    }

    //? ---------------------------------------------------------------------------------------------
    //! Apply criterial LOG_CHECK: Test ...
    //? ---------------------------------------------------------------------------------------------
    if (selectTest[SMOKE_TEST_CRITERIA].LOG_CHECK || false) {
      // Plot init test...
      let passTestLogCheck = await checkLogs.searchLogsErr(dataBeforeToStart);
      logCheck = passTestLogCheck;
    }

    //? Get duration of Tests.
    var end = new tc.nowUtc();
    var duration = end.diff(start);
    duration = duration.seconds();

    //! Repit test in case of fail
    let passTest = false;

    console.log(pingTcp);
    console.log(logCheck);
    console.log(upService);
    console.log(endpoints);
    console.log(crossLogs);

    if (
      (pingTcp || pingTcp === "DISABLED") &&
      (logCheck || logCheck === "DISABLED") &&
      (upService || upService === "DISABLED") &&
      (active_all_endPoints || active_all_endPoints === "DISABLED") &&
      (crossLogs || crossLogs === "DISABLED")
    ) {
      passTest = true;
    }

    if (
      !pingTcp ||
      !logCheck ||
      !upService ||
      !endpoints ||
      !crossLogs ||
      !active_all_endPoints
    ) {
      COUNT_TRY_SMOKE_TEST_RUN = COUNT_TRY_SMOKE_TEST_RUN + 1;

      if (COUNT_TRY_SMOKE_TEST_RUN > RETRIES_NUMBER) {
        RUN_SMOKE_TEST = false;
        PASS_TEST = true;
      }
    } else {
      RUN_SMOKE_TEST = false;
    }

    let msg = {};
    //! Get data from monitoring.js
    // forked.on("message", (msg) => {
    msg.smokeTestResults = {
      criterial: SMOKE_TEST_CRITERIA,
      pingTcp: pingTcp,
      logCheck: logCheck,
      upService: upService,
      endpoints: endpoints,
      crossLogs: crossLogs,
      allEndpoints: active_all_endPoints,
      testTime: duration,
      passTest: passTest,
    };

    //   let oldDataRow;
    try {
      let rawdata = fs.readFileSync("./logs/TEST/smokeTestResults.json");
      oldDataRow = JSON.parse(rawdata);
    } catch (error) {
      oldDataRow = [];
    }

    oldDataRow.push(msg);
    let data = JSON.stringify(oldDataRow);
    fs.writeFileSync("./logs/TEST/smokeTestResults.json", data);

    // });

    //
  }

  // await sleep(5000);
  // fs.writeFileSync("util/stop.tmp", "true");
  // forked.send({
  //   startOfMonitoring: false,
  //   nameOfreport: name,
  //   nameOfTestLogs: nameOfTestLogs,
  // });

  return PASS_TEST;
}

module.exports.smktests = smktests;
