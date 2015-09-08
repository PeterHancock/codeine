var http = require('http'),
    fs = require('fs'),
    docs = require('./index'),
    args = require('minimist')(process.argv.slice(2)),
    ecstatic = require('ecstatic')(__dirname + '/public')

var server = http.createServer(function(req, res) {
    var file = __dirname + '/examples' + req.url + '.js'
    return fs.exists(file, function(exists) {
        if (exists) {
            return fs.createReadStream(file)
            .pipe(docs(args))
            .pipe(res)
        }
        return ecstatic(req, res)
    })
});

server.listen(args.server.port)

