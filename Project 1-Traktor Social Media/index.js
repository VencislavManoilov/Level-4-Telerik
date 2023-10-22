const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;
const fs = require("fs");
const validator = require("email-validator");
const { type } = require("os");

app.use(express.static('public'));

let profiles = [];

app.get("/", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.listen(PORT, function() {
    console.log("Listening: " + PORT);
    fs.readFile(path.join(__dirname, "Database", "profiles.json"), function(err, data) {
        if(err) {
            console.log(err);
        } else {
            profiles = JSON.parse(data).profiles;
        }
    });
})

app.get("/profiles", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "Database", "profiles.json"))
})

app.get("/register", function(req, res) {
    if(!req.query.new) {
        res.status(200);
        res.sendFile(path.join(__dirname, "public", "register.html"));
    } else {
        let errors = []; // Store validation errors

        // Check if everything is here
        if(!req.query.id) {
            errors.push("Username is required!");
        } else {
            const found = profiles.some(el => el.id === req.query.id);
            if(found) {
                errors.push("Username already exists!");
            }
        }

        if(!req.query.name) {
            errors.push("Name is required!");
        }

        if(!req.query.age) {
            errors.push("Age is required!");
        } else if(isNaN(req.query.age)) {
            errors.push("Age needs to be a number!");
        }

        if(!req.query.gender) {
            errors.push("You must select a gender");
        }

        if(!req.query.email) {
            errors.push("Email is required!");
        } else {
            const isValid = validator.validate(req.query.email);
            if(!isValid) {
                errors.email.push("You must type a valid email!");
            }
        }

        if(!req.query.password) {
            errors.password.push("Password is required!");
        }

        if(!req.query.phone) {
            errors.phone.push("Phone is required!");
        }

        if(errors.length > 0) {
            console.log(errors);
            res.status(400).json(JSON.stringify(errors));
        } else {
            const data = fs.readFileSync(path.join(__dirname, "Database", "profiles.json"));
            const jsonData = JSON.parse(data);
            jsonData.profiles.push({
                id : req.query.id,
                name : req.query.name,
                age : req.query.age,
                gender : req.query.gender,
                email : req.query.email,
                password : req.query.password,
                phone : req.query.phone,
                followers : 0,
                posts : []
            })
            
            fs.writeFileSync(path.join(__dirname, "Database", "profiles.json"), JSON.stringify(jsonData));
            res.status(200).json({success: "Account is succesfully created!"});
        }
    }
});

app.get("/login", function(req, res){
    if(!req.query.new) {
        res.status(200);
        res.sendFile(path.join(__dirname, "public", "login.html"));
    } else {
        if(!req.query.id) {
            res.status(400).json({error: "You must type your username!"});
        } else {
            const found = profiles.some(el => el.id === req.query.id);
            if(!found) {
                res.status(400).json({error: "Username doesn't exist!"});
            }
        }

        if(!req.query.password) {
            res.status(400).json({error: "Password is incorect!"});
        }
    }
})

// app.get("/test", function(req, res) {
//     res.status(200);
//     res.send("Bachka");
// })