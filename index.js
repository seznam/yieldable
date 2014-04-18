var assert = require('assert');

function wrapMethod(method){
    return function() {
        var args = [].slice.call(arguments);
        var ctx = this;
        return function(done) {
            args.push(function(err, result) {
                done(err, result);
            });
            ctx[method].apply(ctx, args);
        };
    };
}

function wrapMethods(src, prefix) {
    if (prefix in src) {
        // already yieldable
        return src;
    }

    src[prefix] = true;

    for (var name in src) {
        if ((name.indexOf("_") === 0) || (name.indexOf(prefix) === 0)) {
            continue;
        }

        var yieldish = prefix + name;

        if (!(yieldish in src) && (typeof src[name] == "function")) {
            src[yieldish] = wrapMethod(name);
        }
    }

    return src;
}

function yieldable(src, prefix) {
    if (prefix) {
        assert('string' == typeof prefix, 'string required');
    } else {
        prefix = 'y$';
    }

    var isArray = Array.isArray(src);
    var stack = [].concat(src);

    stack.forEach(function(item) {
        if ('object' == typeof item) {
            wrapMethods(item, prefix);
        } else if ('function' == typeof item) {
            wrapMethods(item.prototype, prefix);
        }
    });

    if (isArray) {
        return yieldable;
    } else {
        return stack[0];
    }
}

module.exports = yieldable;
