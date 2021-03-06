'use strict';
/***********************objectUtilities: Sridhar Gudimela**********************************/
/*DISCLAIMER: As Long as the above original auth name and this disclaimer maintained, this code is free to use until re-defined terms by Author in future.
Author is not responsible for any software issues that may cause due to the usage of this code.*/


Object.defineProperties(Object.prototype, {
    appendAsArray: {
        enumerable: false,
        value: function( key, val ) {
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
        value: function( key, val ) {
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
            if ((!paths && paths != 0) || !['object', 'string', 'number'].some(keyType => keyType == typeof paths)) {
                throw `Invalid Path(s): ${paths}`;
            } else if (['string', 'number'].some(keyType => keyType == typeof paths)) {
                paths = paths.toString();
                if (paths === '*') {
                    return that;
                } else {
                    return resolveKey(paths);
                }
            } else if (Array.isArray(paths)) {
                return paths.map(path => {
                    if ((!path && path != 0) || !['object', 'string', 'number'].some(keyType => keyType == typeof path)) {
                        throw `Invalid Path: ${path}`;
                    } else {
                        if (['string', 'number'].some(keyType => keyType == typeof path)) {
                            path = path.toString();
                            if (path === '*') {
                                return that;
                            } else {
                                return resolveKey(path);
                            }
                        } else {//object
                            let newKey = Object.keys(path)[0];
                            if (newKey.charAt(0) === '^') {
                                return {[newKey.substr(1)]: path[newKey]};
                            } else  if (path[newKey] === '*') {
                                return {[newKey]: that};
                            }

                            let result = resolveKey(path[newKey]),
                                newVal = path[newKey].split('.').pop().replace(/((^\*))|(\[[0-9]+\])/, '');
                            arr = {};
                            if (result && typeof result === 'object' && result[newKey]) {
                                return {[newKey]: result.evalKey(newKey)};
                            } else {
                                return {[newKey]: result[newVal] || result};
                            }
                        }
                    }
                });
            } else {//object
                let newKey = Object.keys(paths)[0];
                if (newKey.charAt(0) === '^') {
                    return {[newKey.substr(1)]: paths[newKey]};
                } else if (paths[newKey] === '*') {
                    return {[newKey] : that};
                }
                let result = resolveKey(paths[newKey]),
                    newVal = paths[newKey].split('.').pop().replace(/((^\*))|(\[[0-9]+\])/, '');
                if (result && typeof result === 'object' && result[newKey]) {
                    return {[newKey]: result.evalKey(newKey)};
                } else {
                    return {[newKey]: result[newVal] || result};
                }
            }

            function resolveKey(keys) {
                obj = Object.assign(that, {});
                if (keys.charAt(0) === '^') {
                    return keys.substr(1);
                }
                keys = keys.replace(/(\.\*\.)|(\.\*$)/g, '.').split('.');
                keys.forEach(key => {
                    function recursive(obj, key) {
                        let keyStrip = key.replace(/(^\*)/g, ''), arr = {};
                        for (let id in obj) {
                            if (obj.evalKey(id) && typeof obj.evalKey(id) === 'object') {
                                if (id == keyStrip.replace(/\[[0-9]+\]/, '')) {
                                    arr.appendAsArray(id, obj.evalKey(keyStrip));
                                } else if (!obj.hasOwnProperty(keyStrip.replace(/\[[0-9]+\]/, '')) && key.charAt(0) === '*') {
                                    let deepObj = recursive(obj.evalKey(id), key);
                                    arr.appendAsArray(Object.keys(deepObj)[0], deepObj.evalKey(Object.keys(deepObj)[0]));}
                            } else if (id == keyStrip.replace(/\[[0-9]+\]/, '')) {
                                arr.appendAsArray(id, obj.evalKey(keyStrip));
                            }
                        }
                        obj = arr;
                        return obj;
                    }
                    obj = recursive(obj, key);
                    let keyStrip = key.replace(/(^\*)|(\[[0-9]+\])/g, '');
                    arr.appendAsArray(keyStrip, obj[keyStrip]);
                });
                return arr;
            }
        }
    },
    resolvePathsAsObject: {
        enumerable: false,
        value: function (paths) {
            let that = this,
                result = that.resolveByPaths(paths),
                obj = {};
            if (Array.isArray(result)) {
                result.forEach(pathRec => {
                    let pathKey = Object.keys(pathRec)[0];
                    let pathVal = pathRec[pathKey];
                    if (obj[pathKey]) {
                        obj.appendAsArray(pathKey, pathVal)
                    } else {
                        obj[pathKey] = pathVal;
                    }
                });
                return obj;
            } else {
                return result;
            }
        }
    }
});


