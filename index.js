var generate = require('./lib/generate'),
    resolveTemplate = require('./lib/resolve-template'),
    vfs = require('vinyl-fs')
    map = require('map-stream'),
    through = require('through2'),
    merge = require('merge-stream'),
    duplexer = require('duplexer');

module.exports = function (config) {

    var rs = through.obj();
    var ws = through.obj();

    resolveTemplate(config.template, function(err, template) {
        config.page = template.page
        var s = ws.pipe(map(function (f, cb) {
                f.path = f.path.replace(/\.js$/,'.html')
                f.contents = f.contents.pipe(generate(config))
                    // Why do we have to do this?
                    .pipe(through());
                cb(null, f)
            }))
        if (template.static) {
            s = merge(s, vfs.src(template.static +  '/**'))
        }
        s.pipe(rs);
    });

    return duplexer(ws, rs);
}
