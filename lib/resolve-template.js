var isObject = require('is-object'),
    path= require('path')
    resolve = require('resolve');

module.exports = function(template, cb) {
    if (!template) {
        return cb(null, {});
    }

    if (isObject(template)) {
        return cb(null, {
            page: template.page,
            static: template.static
        })
    }

    // Test if template module
    return resolve(template + '/page.html', { basedir: path.resolve('.') },  function (err, page) {
        if (!err) {
            return cb(null, {
                page: page,
                static: path.dirname(page) + '/static'
            })
        } else {
            return cb(null, {
                page: template
            })
        }
    })
}
