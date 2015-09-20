var marked = require('marked'),
    resolveTemplate = require('./resolve-template'),
    splitter = require('./source-splitter'),
    fs = require('fs'),
    trumpet = require('trumpet'),
    template = require('html-template'),
    map = require('map-stream'),
    through = require('through2'),
    duplexer = require('duplexer');

/*
# generate

*/
module.exports = function (config) {
    config = config || {};

    var rs = through();

    var ws = through();

    if (config.markdown) {
        generateMarkdown(ws, rs, config);
    } else {
        generateHtml(ws, rs, config);
    }
    return duplexer(ws, rs);
}

function generateHtml(ws, rs, config) {

    var view = Object.assign({}, config.view);

    if (!view.title) {
        view.title = view.srcfile
    }

    var formatter = config.formatter || {};

    var commentFormatter = formatter.comments || require('marked');

    var codeFormatter = formatter.code || (code => code);

    var postProcess = config.base ? require('./fix-urls')(config.base) : through()

    var html = template();

    var code = html.template('code-item');

    function renderCode(data) {
        return {
            '[key=comment]': commentFormatter(data.comment)
            ,'[key=code]': codeFormatter(data.code) || null
        }
    }

    resolveTemplate(config.template, (err, template) => {
        if (err) {
            throw err
        }
        template.render(view, template.opts)
            .pipe(html)
            .pipe(postProcess)
            .pipe(rs)
    })

    ws.pipe(splitter((err) => console.error(view.srcfile, err))).pipe(map(function(data, cb) {
            cb(null, renderCode(data))
        }))
        .pipe(code);
}

function generateMarkdown(ws, rs, config) {
    var view = config.view || {};

    var formatter = config.formatter || {};

    var codeFormatter = formatter.code || (code => code ? code : null );

    function renderCode(data) {
        return `${ data.comment }
\`\`\` javascript
${ codeFormatter(data.code) }
\`\`\`
`
    }

    ws.pipe(splitter((err) => console.error(view.srcfile, err)))
        .pipe(map(function(data, cb) {
            cb(null, renderCode(data))
        }))
        .pipe(rs);

}
