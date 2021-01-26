const run = require("./service/testLibrary/run.js");

// GET ENVIROMENT VARIABLE
const _ = require("lodash");
const env = process.env.NODE_ENV || "dev";
let config = require("./config.json");
global.config = _.merge(config["dev"], config[env]);


function transpose(arr) {
  return Object.keys(arr[0]).map(function (c) {
    return arr.map(function (r) {
      return r[c];
    });
  });
}

run.smktests();

