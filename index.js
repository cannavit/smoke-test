const serviceUp   = require("./service/testLibrary/servicesUp");
const tcp         = require("./service/testLibrary/ping");

// let criterial = 'execution_unit_coverage'
let criterial = 'service_coverage'

let config    = { 
    SERVICES_NAME: [
        "www.google.com",
        "www.google.com"
    ]
}  


async function smktest(criterial, config) {
     
    console.log('criterial: ', criterial)
    console.log('config: ', config)

    let passTest_result 

    if (criterial === 'execution_unit_coverage'){
       const { passTest } = await serviceUp.status(config);
       passTest_result    = passTest ;
    } else if ( criterial === 'service_coverage'){
       let results = await tcp.checkNetwork(config);
       passTest_result = results.successPing;
        
    }
    
    console.log("passTest: ", passTest_result)
    




}

async function test(criterial, config){   

    let passTest = await smktest(criterial ,config)

}

test(criterial, config)

