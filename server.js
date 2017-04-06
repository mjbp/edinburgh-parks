const express = require('express'),
      bodyParser = require('body-parser'),
      path = require('path'),
      app = express(),  
      port = process.env.PORT || 8080,
      router = express.Router();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});


app.listen(port, function() {
    console.log('server listening on port ' + port);
});

