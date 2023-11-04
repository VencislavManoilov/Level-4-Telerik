const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;
const fs = require("fs");
const validator = require("email-validator");
const { type } = require("os");

app.use(express.static('public'));

let profiles = [], key = "", allSessions = [];

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

function profileIndex(id) {
    for(let i = 0; i < profiles.length; i++) {
        if(profiles[i].id == id) {
            return i;
        }
    }
}

function checkSessions() {
    allSessions = JSON.parse(fs.readFileSync(path.join(__dirname, "Database", "sessions.json"), {encoding: 'utf8'})).sessions;
}

function updateSession(ide) {
    const newKey = getSessionKey();

    allSessions.push({key : newKey, id : ide});
    uploadSession(allSessions);

    return newKey;
}

function uploadSession(sessions) {
    fs.writeFileSync(path.join(__dirname, "Database", "sessions.json"), '{"sessions":' + JSON.stringify(sessions) + '}');
    checkSessions();
}

function getSessionKey() {
    const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const length = 64;

    let sessionKey = "";

    for(let i = 0; i < length; i++) {
        sessionKey += char[Math.floor(Math.random() * char.length)];
    }

    return sessionKey;
}

app.get("/", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.listen(PORT, function() {
    console.log("Listening: " + PORT);
    checkProfiles();
    checkSessions();
})

app.get("/profiles", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "Database", "profiles.json"))
})

app.get("/profilePic/:id", function(req, res) {
    const id = req.params.id;
    const imagePath = path.join(__dirname, "Database", "ProfilePics", id + ".png");
    res.sendFile(imagePath);
});

app.get("/:profileId/:postId", function(req, res) {
    const profileId = req.params.profileId;
    const postId = req.params.postId;
    
    const imagePath = path.join(__dirname, "Database", "Posts", profileId, postId + ".jpg");

    res.sendFile(imagePath);
})

app.post("/changePic", function(req, res) {
    const ide = profiles.find(i)
})

app.get("/session", function(req, res) {
    if(!req.query.key) {
        res.status(400).json({ error: "Missing session key" });
    } else {
        const theSession = allSessions.find(s => s.key == req.query.key);
        if(theSession) {
            const profileData = profiles[profileIndex(theSession.id)];
            res.status(200).json({ profile: profileData });
        } else {
            res.status(400).json({ error: "Invalid session key" });
        }
    }
});

app.delete("/session", function(req, res) {
    if(!req.query.id) {
        res.status(400).json({ error: "Id is missing!" });
    } else {
        const theSession = allSessions.find(s => s.id == req.query.id);
        if(theSession) {
            const index = allSessions.indexOf(theSession);
            allSessions.splice(index, 1);
            uploadSession(allSessions);
            res.status(200).json({ ok: true })
        } else {
            res.status(400).json({ error: "Id is not correct!" });
        }
    }
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

        let pic = 1;
        if(req.query.profilePic >= 1 && req.query.profilePic <= 4) {
            pic = Math.floor(req.query.profilePic);
        }

        if(errors.length > 0) {
            res.status(400).json(errors);
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
                profilePic : "default" + pic,
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
                        if(profiles[i].id == req.query.id) {
                            if(profiles[i].password != req.query.password) {
                                errors.push("Password is not correct!");
                                i = profiles.length;
                            }
                        }
                    }
                }
            }
        }

        if(errors.length > 0) {
            res.status(400).json(errors);
        } else {
            const newKey = updateSession(req.query.id);

            res.status(200);
            res.send(JSON.stringify(["Success!", newKey]));
        }
    }
})

// app.get("/test", function(req, res) {
//     res.status(200);
//     res.send("Bachka");
// })