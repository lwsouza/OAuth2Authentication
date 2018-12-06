var express = require('express');
var bodyParser = require('body-parser');
var oauth2 = require('./app/authentication/oauth2');

var app = express();
var cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/oauth', oauth2.router);

app.get("/", function(req, res){
    res.json({status: "API está funcionando!"});
});

const port = process.env.PORT || 8888;
app.listen(port, function(){
    console.log('Listening on port', port);
});