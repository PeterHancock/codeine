var trumpet = require('trumpet'),
through = require('through2');

/*
This module exports a function that prefixes `src` and `href` absolute URLs with `base`
*/
module.exports = function fixUrls(base) {
    base = base || '';
    var rs = through();
    var ws = through();
    var tr = trumpet();
    ['src', 'href'].forEach(function (att) {
        tr.selectAll('[' + att + ']', function (el) {
        el.getAttribute(att, function (val) {
            if (val.match('^/')) {
                el.setAttribute(att, base + val);
            }
        })
    });
    })
    ws.pipe(tr).pipe(rs);

    return require('duplexer')(ws, rs);
}
