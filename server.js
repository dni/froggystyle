express = require('express');

app = express();

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});