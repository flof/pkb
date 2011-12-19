
/**
 * Module dependencies.
 */

var express = require('express')
  , query = require('./query');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
  res.redirect('/items');
});

app.get('/items', function(req, res) {
  query.findItems(req.param('q', ''), req.param('start', 0), function(err, result) {
    res.render('items', {title: 'pkb', list: result.list, count: result.count});
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
