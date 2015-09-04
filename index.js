var marked = require('marked'),
    splitter = require('./lib/source-splitter'),
    through = require('through'),
    fs = require('fs'),
    trumpet = require('trumpet');

var tr = trumpet();

tr.pipe(process.stdout);

var ws = tr.select('#code-list').createWriteStream();

fs.createReadStream(__dirname + '/templates/page.html').pipe(tr);

process.stdin
    .pipe(splitter())
    .pipe(through(function (data) {
        ws.write('<div>' + marked(data.comment) + '</div>');
        if (data.code) {
            ws.write('<div><pre class="language-javascript"><code class="language-javascript">' + data.code + '</code></pre></div>');
        }
    }))
    .pipe(ws)
