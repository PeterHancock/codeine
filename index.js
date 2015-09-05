var marked = require('marked'),
    splitter = require('./lib/source-splitter'),
    fs = require('fs'),
    trumpet = require('trumpet'),
    template = require('html-template'),
    map = require('map-stream'),
    through = require('through2'),
    duplexer = require('duplexer');

module.exports = function (config) {

    config = config || {}

    var page = fs.createReadStream(config.page || __dirname + '/templates/page.html');
    var view = config.view || {};

    var formatter = config.formatter || {};

    var commentFormatter = formatter.comments || require('marked');
    var codeFormatter = formatter.code || function (code) { return code.trim() }

    var pageFormatter = formatter.page || function (view) {
        var tr = trumpet();
        if (view.title) {
            tr.selectAll('.title', function (el) {
                el.createWriteStream().end(view.title.toString());
            });
        }
        return tr;
    }

    function renderCode(data) {
        return {
            '[key=comment]': commentFormatter(data.comment)
            ,'[key=code]': codeFormatter(data.code) || null
        }
    }

    var html = template();
    var code = html.template('code-item');

    var rs = through();
    var ws = through();

    var postProcess = config.base ? require('./lib/fix-urls')(config.base) : through()

    page.pipe(pageFormatter(view))
        .pipe(html)
        .pipe(postProcess)
        .pipe(rs)

    ws.pipe(splitter())
        .pipe(map(function(data, cb) {
            cb(null, renderCode(data))
        }))
        .pipe(code);

    return duplexer(ws, rs);
}
