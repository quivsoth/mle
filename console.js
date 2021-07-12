console.log('Console Log started at : ' + new Date(Date.now()).toString());

var products = [];
// var item = {};

var seeder = 1;

// item.productId = id_;
// item.productName = "Trench Coat " + id_;
// item.description = "Product description will go here - a brief two sentence description";
// item.price = 75;
// item.size = 4;
// item.active = true;




const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants');
var fs = require('fs');
var walkPath = './worker';

var walk = function (dir, done) {
    fs.readdir(dir, function (error, list) {
        var item = {};
        item.productId = seeder;
        item.productName = "Trench Coat " + seeder;
        item.description = "Product description will go here - a brief two sentence description";
        item.price = 75;
        item.size = 4;
        item.active = true;
        item.productThumbs = [];

        if (error) { return done(error);}

        var i = 0;

        (function next () {
            var file = list[i++];


            if (!file) {
                //add the object to the array
                products.push(item);
                return done(null);
            }

            file = dir + '/' + file;
            fs.stat(file, function (error, stat) {
                if (stat && stat.isDirectory()) {
                    console.log("newdir");
                    products.push(item);
                    seeder++;

                    walk(file, function (error) {
                        next();
                    });
                } else {
                    // do stuff to file here
                    // console.log(file);
                    item.productThumbs.push(file);
                    // productThumbs.push(file)
                    next();
                }
            });
        })();
    });
};

// optional command line params
//      source for walk path
// process.argv.forEach(function (val, index, array) {
//     if (val.indexOf('source') !== -1) {
//         walkPath = val.split('=')[1];
//     }
// });

console.log('-------------------------------------------------------------');
console.log('processing...');
console.log('-------------------------------------------------------------');

walk(walkPath, function(error) {
    if (error) {
        throw error;
    } else {
        console.log("PRoduct total: " + products.length);

        products.forEach(function (val, index, array) {
            console.log(array);
        });
        // console.log("PRoduct total: " + products[0].productThumbs);
        // console.log("PRoduct total: " + products[1].productThumbs);
        // console.log("PRoduct total: " + products[2].productName);
        // console.log("PRoduct total: " + products[3].productName);

        console.log('-------------------------------------------------------------');
        console.log('finished.');
        console.log('-------------------------------------------------------------');
    }
});














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