var acorn = require('acorn'),
    through = require('through2'),
    concat = require('concat-stream'),
    duplexer = require('duplexer');

module.exports = function () {
    var rs = through.obj()
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
                    ws.write({
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

    if (!comment) {
        return ws.end()
    }

    ws.end({
        comment: comment.text,
        code: src.substring(comment.e)
    })
}
