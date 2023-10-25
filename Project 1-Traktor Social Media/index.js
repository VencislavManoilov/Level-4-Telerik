const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;
const fs = require("fs");
const validator = require("email-validator");
const { type } = require("os");

app.use(express.static('public'));

let profiles = [], key = "";

fs.readFile('key.txt', 'utf8', function(err, data) {
    if(err) {
        console.log(err);
        return;
    }

    key = data;
});

function checkProfiles() {
    fs.readFile(path.join(__dirname, "Database", "profiles.json"), function(err, data) {
        if(err) {
            console.log(err);
        } else {
            profiles = JSON.parse(data).profiles;
        }
    });
}

app.get("/", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.listen(PORT, function() {
    console.log("Listening: " + PORT);
    checkProfiles();
})

app.get("/profiles", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "Database", "profiles.json"))
})

app.get("/admin", function(req, res) {
    if(req.query.key == key) {
        res.status(200);
        res.sendFile(path.join(__dirname, "public", "admin.html"));
    } else {
        res.status(200);
        res.sendFile(path.join(__dirname, "public", "idiot.html"));
    }
})

app.delete("/admin", function(req, res) {
    if(req.query.key == key) {
        checkProfiles();
        const found = profiles.some(el => el.id === req.query.id);
        if(found) {
            const index = profiles.findIndex(el => el.id === req.query.id);
            profiles.splice(index, 1);
            fs.writeFileSync(path.join(__dirname, "Database", "profiles.json"), '{"profiles":' + JSON.stringify(profiles) + '}');
            checkProfiles();
            console.log(profiles);
            res.status(200);
            res.send("deleted");
        } else {
            res.status(400);
            res.send("This user isn't found!");
        }
    } else {
        res.status(400);
        res.send("What are you doing you piece of shit?!");
    }
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
                errors.push("You must type a valid email!");
            }
        }

        if(!req.query.password) {
            errors.push("Password is required!");
        }

        if(!req.query.phone) {
            errors.push("Phone is required!");
        }

        if(errors.length > 0) {
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
            res.status(200).json(JSON.stringify(["Success!"]));
        }
    }
});

app.get("/login", function(req, res){
    if(!req.query.new) {
        res.status(200);
        res.sendFile(path.join(__dirname, "public", "login.html"));
    } else {
        let errors = [];

        if(!req.query.id) {
            errors.push("You must type your username!");
        } else {
            const found = profiles.some(el => el.id === req.query.id);
            if(!found) {
                errors.push("Username doesn't exist!");
            } else {
                if(!req.query.password) {
                    errors.push("You must type your password");
                } else {
                    for(let i = 0; i < profiles.length; i++) {
                        const obj = profiles[i];
                        if(obj.id == req.query.id) {
                            if(obj.password != req.query.password) {
                                console.log("Hello")
                                errors.push("Password is not correct!");
                                i = profiles.length;
                            } else {
                                res.status(200).json(["Success!"]);
                            }
                            return;
                        }
                    }
                }

            }
        }

        if(errors.length > 0) {
            console.log("Hello");
            res.status(400).json(errors);
        }
    }
})

// app.get("/test", function(req, res) {
//     res.status(200);
//     res.send("Bachka");
// })