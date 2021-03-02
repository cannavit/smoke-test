let connetionCommand = require('../dictionary/connetionCommand.json')
var shell = require('shelljs')

const { weekDayNoLeapSecs } = require('timezonecomplete')


const getConfigVariable_ENV = require("../../util/getConfigVariable")

async function getIp() {
  
  
  //! GET CONFIGURATION: 
  const {MODE_CONNECT, SERVICE_NAME, SMOKE_TEST_SERVICE_NAME} = await getConfigVariable_ENV.ConfigCommands()
  
  
  if (MODE_CONNECT === 'manual') {
    servicesaddress = SERVICE_NAME
  }
  if (MODE_CONNECT === 'docker') {
    
    var servicesaddress = shell.exec(connetionCommand.docker.SERVICE, {silent: true})
    
    servicesaddress = servicesaddress.stdout
    
    //! Remove name of smoke-test service. 
    let deleteWorld = SMOKE_TEST_SERVICE_NAME
    servicesaddress = servicesaddress.replace(deleteWorld,'')
    servicesaddress = servicesaddress.replace('"",','')  
    
    servicesaddress =
    '[' + servicesaddress.substr(0, servicesaddress.length - 2) + ']'
    
    servicesaddress = eval(servicesaddress)
  }
  if (MODE_CONNECT === 'kubectl') {
    var servicesaddress = shell.exec(connetionCommand.docker.SERVICE, {silent: true})
    
    //! Remove name of smoke-test service.  
    let deleteWorld = SMOKE_TEST_SERVICE_NAME
    servicesaddress = servicesaddress.replace(deleteWorld,'')
    servicesaddress = servicesaddress.replace('"",','')
    
    servicesaddress = servicesaddress.stdout
  }
  
  return servicesaddress
}

// GET PORTS FROM DIFERENTS FORMATS:
async function getPort() {

  let SERVICE = await getIp()
  
  //! GET CONFIGURATION: 
  const {MODE_CONNECT} = await getConfigVariable_ENV.ConfigCommands()
  
  if (MODE_CONNECT === 'manual') {
    listPorts = SERVICE_NAME
  }
  if (MODE_CONNECT === 'docker') {
    
    var ports = shell.exec(connetionCommand.docker.PORT, {silent: true})
    
    ports = ports.stdout

    //! Remove empty port .  
    ports = ports.replace('"",','')
    
    ports = '[' + ports.substr(0, ports.length - 2) + ']'
    ports = eval(ports)
    
    // GET MULTIPORTS
    var listPorts = []
    for (let index = 0; index < SERVICE.length; index++) {
      var service = SERVICE[index]
      var port = ports[index]
      var search1 = 1
      var search2 = 1
      var search3 = 1
      var search4 = 1
      var cont = 0
      
      while (search4 !== -1) {
        cont = cont + 1
        
        // Fromat example 0.0.0.0:2424->2424/tcp, 0.0.0.0:2480->2480/tcp
        search1 = port.search('>') - 1
        search3 = port.search(':') + 1
        search4 = port.search(',')
        search2 = port.search('->/tcp')
        
        if (search2 === -1) {
          search2 = 0
        }

        // Format example 4010-4011/tcp

        if (search3 === 0) {
          search3 = 0
          search1 = port.search('-')
        }
        
        var portSingle = port.substring(search3, search1)
        port = port.substring(search4 + 1, port.length)

        listPorts.push({ service: service, ip: '0.0.0.0', port: portSingle })
      }
    }
  }
  if (MODE_CONNECT === 'kubectl') {
    var ports = shell.exec(connetionCommand.docker.PORT, {silent: true})
    listPorts = servicesportsaddress.stdout
  }
  
  return listPorts
}

module.exports.getPort = getPort
module.exports.getIp = getIp
