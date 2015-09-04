var marked = require('marked'),
    splitter = require('./lib/source-splitter'),
    fs = require('fs'),
    trumpet = require('trumpet'),
    template = require('html-template'),
    map = require('map-stream'),
    through = require('through'),
    duplexer = require('duplexer');

module.exports = function (config) {
    var rs = through();
    var ws = through();
    
    var tr = trumpet();
    var html = template(); 
    var code = html.template('code-item');
    
    var pageHtml = config.template || __dirname + '/templates/page.html'
    
    tr.select('#title').createWriteStream().end('Streaming literate JS')
   
    fs.createReadStream(pageHtml)
        .pipe(tr)
        .pipe(html)
        .pipe(rs);
    
    ws
        .pipe(splitter())
        .pipe(map(function(data, cb) {
            cb(null, renderCodeView(data))
        }))
        .pipe(code);
   
    return duplexer(ws, rs);

}

function renderCodeView(data) {
    return {
        '[key=comment]': marked(data.comment)
        ,'[key=code]': data.code || null
    }
}
