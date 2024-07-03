// const { MongoClient } = require("mongodb");
// const {MONGODB_CONNECTION_STRING}=require('../config/index');
// // Replace the following with your Atlas connection string                                                                                                                                        
// //const url = "mongodb+srv://hamid:0NWrihkrO5ME31iv@cluster0.q8ng97n.mongodb.net/coin-bounce?retryWrites=true&w=majority";

// // Connect to your Atlas cluster
// const client = new MongoClient(MONGODB_CONNECTION_STRING);

// async function run() {
//     try {
//         await client.connect(MONGODB_CONNECTION_STRING);
//         console.log("Successfully connected to Atlas");

//     } catch (err) {
//         console.log(err.stack);
//     }
//     finally {
//         await client.close();
//     }
// }

// run().catch(console.dir);
// module.exports=client;
const { MONGODB_CONNECTION_STRING } = require('../config/index');
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then((conn) => {
    console.log(`connected to DB ${conn.connection.host} is done`);
}).catch((err) => {
    console.log(`error in connection`);
})
