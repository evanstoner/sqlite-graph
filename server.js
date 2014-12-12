var express    = require('express');
var bodyParser = require('body-parser');
var data       = require('./app/data');


var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));




var router = express.Router();

// middleware not yet implemented
router.use(function(req, res, next) {
  next();
});

router.route('/').get(data.listDatabases);
router.route('/:file').get(data.listTables);
router.route('/:file/:table').get(data.listFields);
router.route('/:file/:table/records').get(data.listRecords);

app.use('/api', router);




var port = process.env.PORT || 3000;
app.listen(port);
console.log('sqlite-graph running on port ' + port);
