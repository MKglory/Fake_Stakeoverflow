// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
const mongoose = require('mongoose');
const userArgs = process.argv.slice(2)
const mongoDB = "mongodb://127.0.0.1:27017/fake_so"
const bcrypt = require('bcrypt')


if (userArgs.length < 2) {
    console.error("Error: Please provide a username and password as command-line arguments.");
    process.exit(1);
}

let Account = require("./models/account.js")
let username = userArgs[0];
let password = userArgs[1];
// connect the mongodb
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connected to MongoDB")

        const saltRounds = 10;
        // return the solved promise for hash 
        return bcrypt.genSalt(saltRounds)
            .then((salt) =>{
                return bcrypt.hash(password, salt);
            });
    })
    .then((passwordHash) => {
        console.log("Password hashed")

        function createAdmin(username, email, passwordHash){
            adminDetail = {
                username: username,
                email: email,
                passwordHash: passwordHash,
                admin: 1,
                reputation: 99999
            }
            let admin = new Account(adminDetail);
            return admin.save();
        }

        return createAdmin(username, username, passwordHash)
    })
    .then((admin) => {
        console.log("Admin user created ", admin);
        mongoose.connection.close();
    })
    .catch((error) =>{
        console.log("Connect MongoDB Error:", error);
        mongoose.connection.close()
    })



