var path = require('path'),
    generate = require('./lib/generate'),
    resolveTemplate = require('./lib/resolve-template'),
    vfs = require('vinyl-fs')
    map = require('map-stream'),
    through = require('through2'),
    merge = require('merge-stream'),
    duplexer = require('duplexer')

var main = function (config) {

    var rs = through.obj();
    var ws = through.obj();

    resolveTemplate(config.template, function(err, template) {
        var s = ws.pipe(map(function (f, cb) {
                var conf = Object.assign({}, config, {
                    template: template,
                    view: Object.assign({}, config.view, {
                        srcfile: path.relative(path.join(f.cwd, f.base), f.path)
                    })
                 });
                f.path = f.path.replace(/\.js$/,'.html')
                f.contents = f.contents.pipe(generate(conf))
                    // Why do we have to do this?
                    .pipe(through());
                cb(null, f)
            }))
        if (template.static) {
            s = merge(s, vfs.src(template.static))
        }
        s.pipe(rs);
    });

    return duplexer(ws, rs);
}

main.generate = generate
module.exports = main
