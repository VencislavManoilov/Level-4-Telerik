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
        let ok = true;
        // Check if everything is here
        if(!req.query.id) {
            res.status(400).json({error: "Username is required!"});
            ok = false;
        } else {
            const found = profiles.some(el => el.id === req.query.id);
            if (found){
                res.status(400).json({error: "Username already exists!"});
                ok = false;
            }
        }

        if(!req.query.name) {
            res.status(400).json({error: "Name is required!"});
            ok = false;
        }

        if(!req.query.age) {
            res.status(400).json({error: "Age is required!"});
            ok = false;
        } else {
            if(isNaN(req.query.age)) {
                res.status(400).json({error: "Age needs to be a number!"})
                ok = false;
            }
        }
        
        if(!req.query.gender) {
            res.status(400).json({error: "You must select a gender"});
            ok = false;
        }

        if(!req.query.email) {
            res.status(400).json({error: "Email is required!"});
            ok = false;
        } else {
            const isValid = validator.validate(req.query.email);
            if(!isValid) {
                res.status(400).json({error: "You must type valid email!"});
                ok = false;
            }
        }

        if(!req.query.password) {
            res.status(400).json({error: "Password is required!"});
            ok = false;
        }

        if(!req.query.phone) {
            res.status(400).json({error: "Phone is required!"});
            ok = false;
        }

        // Adding it to the profiles
        if(ok) {
            const data = fs.readFileSync(path.join(__dirname, "Database", "profiles.json"));
            const jsonData = JSON.parse(data);
            jsonData.profiles.push({
                id : req.query.id,
                name : req.query.name,
                age: req.query.age,
                gender : req.query.gender,
                email : req.query.email,
                password : req.query.password,
                phone : req.query.phone,
                followers : 0
            })
            fs.writeFileSync(path.join(__dirname, "Database", "profiles.json"), JSON.stringify(jsonData));
            res.status(200).json({success: "Account is succesfully created!"});
        }
    }
})

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