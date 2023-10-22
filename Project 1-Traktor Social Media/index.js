const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

app.use(express.static('public'));

app.get("/", function(req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.listen(PORT, function() {
    console.log("Listening: " + PORT);
})

app.get("/test", function(req, res) {
    res.status(200);
    res.send("Bachka");
})