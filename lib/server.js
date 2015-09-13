var http = require('http'),
    fs = require('fs'),
    generate = require('./generate'),
    ecstatic = require('ecstatic');



module.exports = function(config) {
    var server = config.server || {}
    var base = config.src || '.'
    var staticHandler = ecstatic(server.static)
    var server = http.createServer(function(req, res) {
        var file = base + req.url + '.js'
        return fs.exists(file, function(exists) {
            if (exists) {
                return fs.createReadStream(file)
                    .pipe(config))
                    .pipe(res)
            }
            return staticHandler(req, res)
        })
    });

    server.listen(server.port || 8080)
}
