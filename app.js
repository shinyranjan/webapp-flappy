var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var csv = require('ya-csv');

var app = express();
app.use(express.static(path.join(__dirname, "")));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(request, response){
    response.sendFile(path.join(__dirname, "pages/index.html"));
});

app.post('/score', function(request, response){
    var name = request.body.fullName;
    var email = request.body.email;
    var score = request.body.score;

    var database = csv.createCsvFileWriter("scores.csv", {"flags": "a"});
    var data = [name, email, score];

    database.writeRecord(data);
    database.writeStream.end();

});

var server = app.listen(8080, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Bob's Flappy Bird listening at http://%s:%s", host, port);
});
