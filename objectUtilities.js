/***********************objectUtilities: Sridhar Gudimela**********************************/
/*DISCLAIMER: As Long as the above original auth name and this disclaimer maintained, this code is free to use.
Author is not responsible for any software issues that may cause due to the usage of this code*/

function loadObjectProperties() {
    Object.defineProperties(Object.prototype, {
        appendAsArray: {
            enumerable: false,
            value: function (key, val) {
                if (this.hasOwnProperty(key)) {
                    if (Array.isArray(val)) {
                        this[key] = this[key].concat(val);
                    } else if (val !== undefined) {
                        this[key].push(val);
                    }
                } else {
                    if (Array.isArray(val)) {
                        this[key] = val;
                    } else if (val !== undefined) {
                        this[key] = [val];
                    }
                }
                return this;
            }
        },
        evalKey: {
            enumerable: false,
            value: function (key, val) {
                if (isNaN(key)) {
                    return eval(`this.${key}`);
                } else {
                    return eval(`this['${key}']`);
                }
            }
        },
        resolveByPaths: {
            enumerable: false,
            value: function (paths) {
                var keys = '', obj = null, that = this, arr = {};
                if ((!paths && paths != 0) || !['object', 'string', 'number'].some(keyType = > keyType == typeof paths))
                {
                    throw `Invalid Path(s): ${paths}`;
                }
            else
                if (['string', 'number'].some(keyType = > keyType == typeof paths))
                {
                    paths = paths.toString();
                    if (paths === '*') {
                        return that;
                    } else {
                        return resolveKey(paths);
                    }
                }
            else
                if (Array.isArray(paths)) {
                    return paths.map(path = > {
                        if((!path && path != 0) || !['object', 'string', 'number'].some(keyType = > keyType == typeof path
                ))
                    {
                        throw `Invalid Path: ${path}`;
                    }
                else
                    {
                        if (['string', 'number'].some(keyType = > keyType == typeof path))
                        {
                            path = path.toString();
                            if (path === '*') {
                                return that;
                            } else {
                                return resolveKey(path);
                            }
                        }
                    else
                        {//object
                            var newKey = Object.keys(path)[0];
                            var newVal = path[newKey].split('.').pop().replace(/((^\*))|(\[[0-9]+\])/, '');
                            if (path[newKey] === '*') return {[newKey]: that};
                            var result = resolveKey(path[newKey]);
                            if (result && typeof result === 'object' && result[newKey]) {
                                return {[newKey]: result.evalKey(newKey)};
                            } else {
                                return {[newKey]: result[newVal] || result};
                            }
                        }
                    }
                })
                    ;
                } else {//object
                    var newKey = Object.keys(paths)[0];
                    var newVal = paths[newKey].split('.').pop().replace(/((^\*))|(\[[0-9]+\])/, '');
                    if (paths[newKey] === '*') return {[newKey]: that};
                    var result = resolveKey(paths[newKey]);
                    if (result && typeof result === 'object' && result[newKey]) {
                        return {[newKey]: result.evalKey(newKey)};
                    } else {
                        return {[newKey]: result[newVal] || result};
                    }
                }

                function resolveKey(keys) {
                    obj = Object.assign(that, {});
                    keys = keys.replace(/(\.\*\.)|(\.\*$)/g, '.').split('.');
                    keys.forEach(key = > {
                        function recursive(obj, key)
                    {
                        var keyStrip = key.replace(/(^\*)/g, ''), arr = {};
                        for (id in obj) {
                            if (obj.evalKey(id) && typeof obj.evalKey(id) === 'object') {
                                if (id == keyStrip.replace(/\[[0-9]+\]/, '')) {
                                    arr.appendAsArray(id, obj.evalKey(keyStrip));
                                } else if (!obj.hasOwnProperty(keyStrip.replace(/\[[0-9]+\]/, '')) && key.charAt(0) === '*') {
                                    var deepObj = recursive(obj.evalKey(id), key);
                                    arr.appendAsArray(Object.keys(deepObj)[0], deepObj.evalKey(Object.keys(deepObj)[0]));
                                }
                            } else if (id == keyStrip.replace(/\[[0-9]+\]/, '')) {
                                arr.appendAsArray(id, obj.evalKey(keyStrip));
                            }
                        }
                        obj = arr;
                        return obj;
                    }
                    obj = recursive(obj, key);
                    var keyStrip = key.replace(/(^\*)|(\[[0-9]+\])/g, '');
                    arr.appendAsArray(keyStrip, obj[keyStrip]);
                })
                    ;
                    return arr;
                }
            }
        }
    });
}

