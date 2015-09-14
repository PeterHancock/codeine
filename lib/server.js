var http = require('http'),
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
            var file = base + req.url.replace(/\.html$/, '') + '.js'
            return fs.exists(file, function(exists) {
                if (exists) {
                    return fs.createReadStream(file)
                        .pipe(generate(config))
                        .pipe(res)
                }
                return staticHandler(req, res)
            })
        });
        server.listen(config.server.port || 8080)

    });
}
