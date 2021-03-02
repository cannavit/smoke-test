const getCommand = require("../dictionary/getCommand");
const Table      = require("tty-table");
const ora        = require("ora");
const getConfigVariable_ENV = require("../../util/getConfigVariable")

async function status(config=undefined) {

  //! Load configuration.
  let services 
  //! Get service name
  let Name  

  if (config === undefined) {
    const { SERVICES_NAME, SMOKE_TEST_SERVICE_NAME } = await getConfigVariable_ENV.ConfigCommands()
    services = SERVICES_NAME
    const name = await getCommand.getListResutls("SERVICE");
    Name = name;
  } else {
    const SERVICES_NAME2 = config.SERVICES_NAME
    services = SERVICES_NAME2
    const name2 = SERVICES_NAME2
    Name = name2
  }
  
  let keyWold = 'Exited'
  //! Get service down
  let servicesName     = await getCommand.getListResutls("STATUS");
  let servicesDisabled = await getCommand.searchInOutput("STATUS", keyWold);
  
  //!Control is all services exist inside to Container Manager: 

  let lackService     = false
  let nameLackService = []

  if (services !== undefined) {

    for (const key in services) {

      let serviceConfigName = services[key]

      if (!Name.includes(serviceConfigName)){
            lackService = true
            nameLackService.push(serviceConfigName)
      }

    }

  }
  

  let tableData = [];
  if (lackService) {
    for (const key in nameLackService) {
      servicesDisabled.detectWord = true
      tableData.push({
        serviceName: nameLackService[key],
        description: "No found service inside to Manager",
        activeService: "False" 
      })

    }
    
  } 
  
  //! Remove name of smoke-test service.  
  let smokeTestContainerName = SMOKE_TEST_SERVICE_NAME

  //! Create Table:
  let passTest = false

  for (const key in Name) {

    let name = Name[key];
    let servicesname = servicesName[key];
    console.log('keyWold:', keyWold)
    let existKeyWold = servicesname.search(keyWold);
    let existD
    
    if (existKeyWold !== -1 && name != smokeTestContainerName) {
      existD = false;
      passTest = true
    } else {
      existD = true;
      passTest = false;
    }
    
    
    if (name != smokeTestContainerName) {

      tableData.push({
        serviceName: name,
        description: servicesname,
        activeService: String(existD),
      });
      
    }
    
  }
  
  //! Add spinner.
  let spinner = ora("Check if all services are UP").start();

  if (!servicesDisabled.detectWord) {
    spinner.succeed();
  } else {
    spinner.fail();
  }
  //! Activate table if test fail.

  if (servicesDisabled.detectWord) {
    let header = [
      { value: "serviceName", width: 25, alias: "Service Name" },
      { value: "description", width: 40, align: "rigth", alias: "Description service-down" },
      {
        alias: "Service Up",
        value: "activeService",
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
    const t3 = Table(header, tableData);


    console.log(t3.render());
  }

  const dataResult = { "servicesDisabled": servicesDisabled,  "passTest": passTest } 

  return dataResult;
}

module.exports.status = status;
// status()