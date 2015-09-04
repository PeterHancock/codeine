var acorn = require('acorn'),
    through = require('through'),
    concat = require('concat-stream'),
    duplexer = require('duplexer');

module.exports = function () {
    var rs = through()
    var ws = concat(function (src) {
        parse(src.toString(), rs);
    })
    return duplexer(ws, rs);
}

function parse(src, ws) { 
    var srcArray = src.split('')
    var comment
    acorn.parse(src, {
        onComment: function(block, text, s, e) {
            if (block) {
                if (comment) {
                    var code = src.substring(comment.e, s);
                    ws.queue({
                        comment: comment.text,
                        code: code
                    });
                } 
                comment = {
                    text: text,
                    s: s,
                    e: e
                }
            }
        }
    })

    ws.end({
        comment: comment.text,
        code: src.substring(comment.e)
    })
}
