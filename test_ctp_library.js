const client = require('ping-tcp-js');
const host = '0.0.0.0';
const port = 4010;

async function checkNetwork() {
 
try {
    var l = await client.pingBackOff(host, port,5,10);
} catch (error) {
    var l = false
}    

}

checkNetwork()