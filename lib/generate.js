var marked = require('marked'),
    resolveTemplate = require('./resolve-template'),
    splitter = require('./source-splitter'),
    fs = require('fs'),
    trumpet = require('trumpet'),
    template = require('html-template'),
    map = require('map-stream'),
    through = require('through2'),
    duplexer = require('duplexer');

module.exports = function (config) {

    config = config || {}

    var view = config.view || {};

    var formatter = config.formatter || {};

    var commentFormatter = formatter.comments || require('marked');
    var codeFormatter = formatter.code || (code => code);

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

    var postProcess = config.base ? require('./fix-urls')(config.base) : through()

    resolveTemplate(config.template, (err, template) => {
        if (err) {
            throw err
        }
        template.render(view, template.opts)
            .pipe(html)
            .pipe(postProcess)
            .pipe(rs)
    })

    ws.pipe(splitter((err) => console.error(view.srcfile, err)))
        .pipe(map(function(data, cb) {
            cb(null, renderCode(data))
        }))
        .pipe(code);

    return duplexer(ws, rs);
}
