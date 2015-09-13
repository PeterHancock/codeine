var fs = require('fs'),
    isObject = require('is-object'),
    isFunction = require('is-function'),
    path= require('path')
    resolve = require('resolve');

module.exports = function(template, cb) {
    if (!template) {
        return cb(null, {
            page: templateStream()
        });
    }

    if (isFunction(template)) {
        return cb(null, {
            page: template
        })
    }

    if (isObject(template)) {
        const page = isFunction(template.page) ? template.page : templateStream(template.page)
        return cb(null, {
            page: page,
            static: template.static
        })
    }

    // Test if template module
    return resolve(template + '/page.html', { basedir: path.resolve('.') },  function (err, page) {
        if (err) { // Assume template is a file path
            return cb(null, {
                page: templateStream(template)
            })
        }
        return cb(null, {
            page: templateStream(page),
            static: path.dirname(page) + '/static'
        })
    })
}

function templateStream(template) {
    template = template || __dirname + '/../templates/page.html';
    return () => fs.createReadStream(template);
}
