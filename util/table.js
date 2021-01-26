const Table = require("cli-table");
const { result } = require("lodash");
const table = new Table();

async function createTable(results) {
  var tableQuery = "table.push(";
  for (let index = 0; index < results.length; index++) {
    tableQuery = tableQuery + "results[" + index + "],";
  }
  tableQuery = tableQuery.substring(0, tableQuery.length - 1);
  tableQuery = tableQuery + ")";
  // eval(tableQuery)
  return tableQuery;
}

module.exports = createTable;
