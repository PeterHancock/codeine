var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    generate = require('./generate'),
    resolveTemplate = require('./resolve-template'),
    ecstatic = require('ecstatic');

/*
A HTTP server for testing documentation.
*/
module.exports = function(config) {
    config.server = config.server || {}
    var base = config.src || '.'
    resolveTemplate(config.template, function(err, template) {
        if (err) {
            throw err;
        }

        var staticHandler = template.static ? ecstatic(template.static) : (req, res) => res.end()
        var server = http.createServer(function(req, res) {
            /*

The URL of the page maps to the `src`-relative JS filename with`.html` optional.
            */
            var srcfile = path.join('/', req.url.replace(/\.html$/, '') + '.js')
            var file = path.join(base, srcfile)
            return fs.exists(file, function(exists) {
                if (exists) {
                    var conf = Object.assign({}, config, {
                        template,
                        view: Object.assign({}, config.view, { srcfile })
                     });
                     /*
generates page on demand
                     */
                    return fs.createReadStream(file)
                        .pipe(generate(conf))
                        .pipe(res)
                }
                /*
static files are served too
                */
                return staticHandler(req, res)
            })
        });
        /*
`server.port` sets the port to listen on.
        */
        server.listen(config.server.port || 8080)
    });
}
