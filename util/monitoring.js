//! Load librarys

const log = require("./loggerMonitoring")("monitoring");
const tc = require("timezonecomplete");
const _ = require("lodash");
const env = process.env.NODE_ENV || "dev";
const config = require("../config.json");
const fs = require("fs-extra");
const path = require("path");
const getCommand = require("../service/dictionary/getCommand");
const util = require("util");
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const stats = require("stats-lite");
const colors = require("colors");
const { clear } = require("winston");
const sleep = require("sleep-promise");

global.config = _.merge(config["dev"], config[env]);

async function changeUnits(changeUnit, unitToChange) {
  for (const key in changeUnit) {
    const element = changeUnit[key];

    let elementUnit = unitToChange.search(element.serachUnit);

    if (elementUnit !== -1) {
      var unit = unitToChange.substr(0, elementUnit) * element.multiply;
    }
  }
  return unit;
}

async function getMonitoringParameters(register) {
  var dataMonitoring = await getCommand.evalCommand("MONITORING");
  var data = dataMonitoring.stdout;

  data = eval("[" + data + "]");
  tableRegister = [];

  for (const key in data) {
    let element = data[key];
    let service = element.Name;
    let CPUPerc = element.CPUPerc.replace("%", "");
    let MemPerc = element.MemPerc.replace("%", "");
    let PIDs = element.PIDs;

    // Preparing variable

    let BlockIO = element.BlockIO;

    let changeUnit = [
      { serachUnit: "B", multiply: 0.000001 },
      { serachUnit: "MB", multiply: 1 },
      { serachUnit: "kB", multiply: 0.001 },
      { serachUnit: "MiB", multiply: 1 },
      { serachUnit: "GiB", multiply: 1024 },
    ];

    let BlockIO_1 = BlockIO.substr(0, BlockIO.search("/"));
    let BlockIO_2 = BlockIO.substr(BlockIO.search("/") + 1, BlockIO.length);
    BlockIO_1 = await changeUnits(changeUnit, BlockIO_1);
    BlockIO_2 = await changeUnits(changeUnit, BlockIO_2);

    let MemUsage = element.MemUsage;
    let MemUsage_1 = MemUsage.substr(0, MemUsage.search("/"));
    let MemUsage_2 = MemUsage.substr(MemUsage.search("/") + 1, MemUsage.length);
    MemUsage_1 = await changeUnits(changeUnit, MemUsage_1);
    MemUsage_2 = await changeUnits(changeUnit, MemUsage_2);

    let NetIO = element.NetIO;
    let NetIO_1 = NetIO.substr(0, NetIO.search("/"));
    let NetIO_2 = NetIO.substr(NetIO.search("/") + 1, NetIO.length);
    NetIO_1 = await changeUnits(changeUnit, NetIO_1);
    NetIO_2 = await changeUnits(changeUnit, NetIO_2);

    //  Serach data inside to buffer data.
    let existDataRegister = false;
    let count = -1;
    let idRegister = -1;
    for (const key in register) {
      count = count + 1;
      const sigleData = register[key];

      if (sigleData.serviceName === service) {
        existDataRegister = true;
        idRegister = count;
      }
    }

    // Init register of data:
    if (!existDataRegister) {
      register.push({
        serviceName: service,
        value: {
          dateTime: [new Date()],
          blockIo: { one: [BlockIO_1], two: [BlockIO_2], unit: "MB" },
          CPUperc: { value: [CPUPerc], unit: "%" },
          MemPerc: { value: [MemPerc], unit: "%" },
          MemUsage: {
            value: [MemUsage_1],
            available: [MemUsage_2],
            unit: "MiB",
          },
          NetIO: { one: [NetIO_1], two: [NetIO_2], unit: "MB" },
          PIDs: { value: [PIDs] },
        },
      });
    } else {
      let controlMonitoring = await readMonitoringControl();

      register[idRegister].value.dateTime.push(new Date());
      register[idRegister].value.blockIo.one.push(BlockIO_1);
      register[idRegister].value.blockIo.two.push(BlockIO_2);
      register[idRegister].value.MemPerc.value.push(MemPerc);
      register[idRegister].value.MemUsage.value.push(MemUsage_1);
      register[idRegister].value.NetIO.one.push(NetIO_1);
      register[idRegister].value.NetIO.two.push(NetIO_2);
      register[idRegister].value.PIDs.value.push(PIDs);

      // Calculate Mean:
      tableRegister.push({
        service: service,
        meanBlockIoOne: stats.mean(register[idRegister].value.blockIo.one),
        meanBlockIoTwo: stats.mean(register[idRegister].value.blockIo.two),
        meanMemPerc: stats.mean(register[idRegister].value.MemPerc.value),
        meanMemUsage: stats.mean(register[idRegister].value.MemUsage.value),
        meanNetIoOne: stats.mean(register[idRegister].value.NetIO.one),
        NetIoTwo: stats.mean(register[idRegister].value.NetIO.two),
        PIDs: stats.mean(register[idRegister].value.PIDs.value),
      });

      register["tableRegister"] = tableRegister;

      log.info(
        "|" +
          BlockIO_1 +
          "|" +
          BlockIO_2 +
          "|" +
          MemPerc +
          "|" +
          MemUsage_1 +
          "|" +
          NetIO_1 +
          "|" +
          NetIO_2 +
          "|" +
          NetIO_2 +
          "|" +
          PIDs +
          "|" +
          controlMonitoring.monitoring +
          "|" +
          controlMonitoring.passTest +
          "|" +
          controlMonitoring.tag
      );
    }
  }

  return register;
}

async function monitoringControl(dataMonitoring) {
  /** 
   * @param:  dataMonitoring = {
                     monitoring: true,
                     passTest: false,
                     tag: "init"
                               };
   */

  // !  write params in file document.
  let dataMonitoringJson = JSON.stringify(dataMonitoring, null, 2);
  fs.writeFile(
    "./checkLogsHistory/monitoringParams.json",
    dataMonitoringJson,
    "utf8"
  );
}

module.exports.monitoringControl = monitoringControl;

async function readMonitoringControl() {
  //! Read variable.

  var result = {
    monitoring: process.env.monitoring,
    passTest: process.env.passTest,
    tag: process.env.monitoring,
  };

  try {
    result = await JSON.parse(result);
  } catch (error) {
    let dataMonitoring = {
      monitoring: true,
      passTest: false,
      tag: "init",
    };

    monitoringControl(dataMonitoring);
  }
  return result;
}

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

//FIXME Change control for monitoring.

async function collectionMonitoringParameters(msg) {
  console.log(colors.bgGreen("Start Monitoring resources now!"));
  var register = [];
  //* Table Header

  var MONITORING = process.env.MONITORING || true;
  var start = new tc.nowUtc();
  let printTableCsv = [];
  let startOfMonitoring = msg.startOfMonitoring;
  let dataJsonFormat = {};
  let countInit = -1;

  var countProcess = -1;

  var count2 = -1;

  while (MONITORING && startOfMonitoring) {
    count2 = count2 + 1;
    var stopControl = fs.readFileSync("util/stop.tmp", "utf8");

    if (stopControl === "true") {
      console.log("STOP MONITORING");
      MONITORING = false;
      startOfMonitoring = false;
      console.log(colors.bgRed(" STOP MONITORING RESOURCES"));
    }

    countProcess = countProcess + 1;

    //if (countProcess > 5) {

    countProcess = 0;

    register = await getMonitoringParameters(register);
    controlData = await readMonitoringControl();

    //! Calculate time for down monitoring task

    var end = new tc.nowUtc();
    var duration = end.diff(start);
    duration = duration.seconds();

    //! Save measurement.

    countInit = countInit + 1;
    for (const key in register["tableRegister"]) {
      let dataPrintTable = register["tableRegister"][key];
      printTableCsv.push(dataPrintTable);

      var jsonItem = Object.keys(dataPrintTable);

      for (const key in jsonItem) {
        itemJsonData = jsonItem[key];

        if (itemJsonData != "service") {
          //? Build array for send inside of reports.
          try {
            dataJsonFormat[dataPrintTable.service][itemJsonData].push(
              dataPrintTable[itemJsonData]
            );
          } catch (error) {
            try {
              dataJsonFormat[dataPrintTable.service][itemJsonData] = [];
              dataJsonFormat[dataPrintTable.service][itemJsonData].push(
                dataPrintTable[itemJsonData]
              );
            } catch (error) {
              dataJsonFormat[dataPrintTable.service] = {};
              dataJsonFormat[dataPrintTable.service][itemJsonData] = [];
              dataJsonFormat[dataPrintTable.service][itemJsonData].push(
                dataPrintTable[itemJsonData]
              );
            }
          }
        }
      }
    }

    //! Time Control
    let MONITORING_TIME = global.config.MONITORING_TIME;

    var BREAK = false;
    if (count2 > 20) {
      BREAK = true;
    }

    console.log("------ ----- ----- ------ duration:");
    console.log(MONITORING_TIME, duration + 10, duration > MONITORING_TIME);

    if (duration + 10 > MONITORING_TIME || BREAK) {
      //? Order data:
      process.send({
        monitoringData: {
          data: dataJsonFormat,
        },
      });
      MONITORING = true;
      break;
    }
  }

  console.log(colors.bgRed(" STOP MONITORING RESOURCES"));

  return [register];
}

process.on("message", (msg) => {
  collectionMonitoringParameters(msg);
});
