var fs      = require('fs');
var sqlite3 = require('sqlite3').verbose();
var _       = require('underscore');
var reply   = require('./reply');
var config  = require('../config');

function isValidName(s) {
  return !!s.match(/^[a-z0-9_]*$/);
}

exports.listDatabases = function(req, res) {
  fs.readdir(config.DATA_DIR, function(err, files) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, { databases: files });
    }
  });
};

exports.listTables = function(req, res) {
  var file = req.params.file;
  console.log('listTables', file);
  var db = new sqlite3.Database(config.DATA_DIR + file, sqlite3.OPEN_READONLY);
  db.all('SELECT name FROM sqlite_master WHERE type="table"', function(err, rows) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, { tables: rows });
    }
  });
};

exports.listFields = function(req, res) {
  var file = req.params.file;
  var table = req.params.table;
  console.log('listFields', file, table);
  var db = new sqlite3.Database(config.DATA_DIR + file, sqlite3.OPEN_READONLY);

  if (!isValidName(table)) {
    reply.error(res, 'Invalid table name: `' + table + '`');
    return;
  }

  db.all('PRAGMA table_info("' + table + '")', function(err, rows) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, {
        fields: _.map(rows, function(row) {
          var newRow = {};
          newRow.name = row.name;
          newRow.type = row.type;
          return newRow;
        })
      });
    }
  });
};

exports.listRecords = function(req, res) {
  var file = req.params.file;
  var table = req.params.table;
  var x = req.query.x;
  var y = req.query.y;
  console.log('listRecords', file, table, x, y);
  var db = new sqlite3.Database(config.DATA_DIR + file, sqlite3.OPEN_READONLY);

  if (!isValidName(x) || !isValidName(y)) {
    reply.error(res, 'Invalid column name: `' + x + '` or `' + y + '`');
    return;
  }

  db.all('SELECT ' + x + ',' + y + ' FROM ' + table, function(err, rows) {
    if (err) {
      reply.error(res, err);
    } else {
      reply.success(res, {
        records: _.map(rows, function(row) {
          var newRow = {};
          newRow.x = row[x];
          newRow.y = row[y];
          return newRow;
        })
      });
    }
  });
};
