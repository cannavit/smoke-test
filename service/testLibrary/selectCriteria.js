const check  = require('./ping');
const log = require('../../util/logger')('editionService')

async function test() {
    var response =  await check.Ping('www.google.com')
    //var response = check()

}



test()