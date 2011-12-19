var pg = require('pg'),
  async = require('async');

// TODO move to config
var conString = "tcp://pkb:pkb@localhost/pkb";

exports.findItems = function(q, start, callback) {
  pg.connect(conString, function(err, client) {
    async.parallel({
      itemList: function(callback) {
        getItemList(q, start, client, callback);
      },
      itemCount: function(callback) {
        getItemCount(q, client, callback);
      }
    },
    function(err, result) {
      callback(err, {
        'list': result.itemList,
        'count': result.itemCount
      });
    });
  });
}

function getItemList(q, start, client, callback) {
  var whereClause = getSearchWhereClause(q, 1);
  var idx = whereClause.nextParamIndex;
  var sql = 'select id, subject, creation_date, last_edit_date from item where '
    + whereClause.sql
    + ' order by id desc offset $' + idx++ + ' limit $' + idx++;
  var params = whereClause.params;
  params.push(start, 10);
  client.query(sql, params, callback);
}

function getItemCount(q, client, callback) {
  var whereClause = getSearchWhereClause(q, 1);
  var sql = 'select count(id) from item where '
    + whereClause.sql;
  client.query(sql, whereClause.params, callback);
}

function getSearchWhereClause(q, startParamIndex) {
  var sql = '';
  var params = [];

  var idx = startParamIndex;
  q.split(' ').forEach(function(term) {
    if(sql) {
      sql += 'and';
    }
    sql += ' upper(body) like upper($' + idx++ + ') ';
    params.push('%' + term + '%');
  });

  return {sql: sql, params: params, nextParamIndex: idx};
}
