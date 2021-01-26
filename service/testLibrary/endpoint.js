// Get config data.
const _ = require("lodash");
const config = require("../../config.json");
const env = process.env.NODE_ENV || "dev";
global.config = _.merge(config["dev"], config[env]);
const axios = require("axios");
// REQUEST:
const shell = require("shelljs");

// Logs commands
const ora = require("ora");
const { forEach } = require("lodash");
const Table = require("tty-table");
const getConfigVariable_ENV = require("../../util/getConfigVariable")
async function check() {
  
  //! Get the variables:  
  const { ENDPOINT_HOST } = await getConfigVariable_ENV.ConfigCommands()
  
  // Get parameters
  let ENDPOINT_LIST = global.config.ENDPOINT_LIST;
  let variable = {};
  let variableSaved = [];
  let statusCode = 0;
  let dataTable = [];
  let passTest = true;
  // set request:
  for (const key in ENDPOINT_LIST) {
    let options = {};
    let data = ENDPOINT_LIST[key];

    data.URL = data.URL.replace(":ENDPOINT_HOST", ENDPOINT_HOST);

    // Save variable name:
    if (data.SAVE_VARIABLE !== undefined) {
      for (let iName of data.SAVE_VARIABLE) {
        variableSaved.push(iName);
      }
    }

    // Build request option.
    if (data.HEADER !== undefined) {
      options.headers = data.HEADER;
      // Eval Variables.
      for (let index in variableSaved) {
        iName = variableSaved[index];

        if (options.headers[iName] !== undefined) {
          options.headers[iName] = options.headers[iName].replace(":" + iName, variable[iName]);
        }
      }
    }

    if (data.BODY !== undefined) {
      options.body = data.BODY;
    }

    // USE VERB POST
    let PassTestList = false;
    if (data.VERB === "POST") {
      PassTestList = true;
      try {
        let response = await axios.post(data.URL, data.BODY, options);
        statusCode = response.request.res.statusCode;

        let dataRequest = response.data;
        // GET VARIABLES
        if (data.SAVE_VARIABLE !== undefined) {
          for (const nameVariable of data.SAVE_VARIABLE) {
            variable[nameVariable] = dataRequest[nameVariable];
          }
        }
      } catch {
        passTest = false;
        PassTestList = false;
        statusCode = 500;
      }
    }
    //  USE VER GET:

    // TODO configurar api GET.
    // if (data.VERB === "GET") {
    // let response = await axios.get(data.URL, options);
    // let response = axios.get(data.URL, options);
    // axios.get("https://urlhere.com", {
    //   headers: { "header-name": "header-value" },
    // });
    // console.log(response);
    // }

    //! Push data for print Table.
    dataTable.push({
      nameTest: data.NAME,
      apiVerb: data.VERB,
      url: data.URL,
      saveVariable: data.SAVE_VARIABLE,
      respose: statusCode,
      passTest: String(PassTestList),
    });
  }

  //! Print spinner
  // Print status of the check:
  if (statusCode === 200) {
    let spinner = ora("Verify Endpoint availability: PASS").succeed();
  } else {
    let spinner = ora("Verify response of the Endpoint: FAIL").fail();
  }

  //! Print Table whit result of test.
  if (!passTest) {
    let header = [
      { value: "nameTest", width: 25, alias: "Test name" },
      { value: "apiVerb", width: 10, alias: "Api Verb" },
      { value: "url", width: 30, alias: "Api address" },
      { value: "saveVariable", width: 30, alias: "Save variable" },
      { value: "respose", width: 12, alias: "Request code" },
      {
        value: "passTest",
        width: 12,
        alias: "Test passed",
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

    const t3 = Table(header, dataTable);
    console.log(t3.render());
  }
  return passTest
}

module.exports.check = check;
