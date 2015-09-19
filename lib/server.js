var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    generate = require('./generate'),
    resolveTemplate = require('./resolve-template'),
    ecstatic = require('ecstatic');



module.exports = function(config) {
    config.server = config.server || {}
    var base = config.src || '.'
    resolveTemplate(config.template, function(err, template) {
        if (err) {
            throw err;
        }
        var staticHandler = template.static ? ecstatic(template.static) : (req, res) => res.end()
        var server = http.createServer(function(req, res) {
            var srcfile = path.join('/', req.url.replace(/\.html$/, '') + '.js')
            var file = path.join(base, srcfile)
            return fs.exists(file, function(exists) {
                if (exists) {
                    var conf = Object.assign({}, config, {
                        template,
                        view: Object.assign({}, config.view, { srcfile })
                     });
                    return fs.createReadStream(file)
                        .pipe(generate(conf))
                        .pipe(res)
                }
                return staticHandler(req, res)
            })
        });
        server.listen(config.server.port || 8080)
    });
}
