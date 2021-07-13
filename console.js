console.log('Console Log started at : ' + new Date(Date.now()).toString());
const fs = require('fs');

const path = './worker/trenched';



//--------------------------------------------------------------------------
// var mongoose = require('mongoose');
// const uri = `mongodb://192.168.1.3:27017/shop`;
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// var User = require('./models/userSchema');

// var newUser = new User();
//         newUser.email = "gege@gmail.com";
//         newUser.password = newUser.encryptPassword("password");
//         newUser.save();


// const connection = mongoose.connection;
// connection.once("open", function() {
//     console.log("MongoDB database connection established successfully");
//   });

//User.findOne({'email': email}


// const {MongoClient} = require('mongodb');
// const uri = `mongodb://192.168.1.3:27017`;

// getUser("email@email.com");

// var p = {};
// p.email = "reg@gmail.com";
// p.password = "rerbhbrhcom";


// insertUser(p);


// async function insertUser(person){
//     const client = new MongoClient(uri, { useUnifiedTopology: true });
//     try {
//         await client.connect();
//         await client.db("shop").collection("user").insertOne(person);
//     } catch (e) { console.error(e); }
//     finally { await client.close(); }
// }

// async function getUser(emailAddress){
//     const client = new MongoClient(uri, { useUnifiedTopology: true });
//     try {
//         await client.connect();
//         const person = await client.db("shop").collection("user").findOne({email: emailAddress});
//         console.log(person);
//         return person;
//     } catch (e) { console.error(e); }
//     finally { await client.close(); }
// }