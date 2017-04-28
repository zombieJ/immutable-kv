"use strict";
exports.__esModule = true;
function isEmpty(arr, i) {
    var char = arr[i];
    if (['\t', ' ', '\r', '\n'].includes(char))
        return true;
}
function getComment(arr, start, end) {
    if (arr[start] !== '/' || arr[start + 1] !== '/')
        return null;
    var comment = '';
    var endLoc = end;
    for (var i = start + 2; i < end; i += 1) {
        var c = arr[i];
        if (c !== '\r' && c !== '\n') {
            comment += c;
        }
        else {
            endLoc = i - 1;
            break;
        }
    }
    return {
        start: start,
        end: endLoc,
        comment: comment.replace(/^\s/, '')
    };
}
/***
 * Will check comment until new line
 * @param arr
 * @param start
 * @param end
 */
function getConnectComment(arr, start, end) {
    var commentObj = undefined;
    for (var i = start; i < end; i += 1) {
        var c = arr[i];
        if (c === '\r' || c === '\n')
            break;
        if (c === '/' && arr[i + 1] === '/') {
            commentObj = getComment(arr, i, end);
        }
        else if (c !== '\t' && c !== ' ') {
            break;
        }
    }
    return commentObj;
}
function getStr(arr, start, end) {
    if (arr[start] !== '"')
        return null;
    var str = '';
    var escape = false;
    var endLoc = end;
    for (var i = start + 1; i < end; i += 1) {
        var c = arr[i];
        if (escape || (c !== '"' && c !== '\\')) {
            escape = false;
            str += c;
        }
        else if (c === '\\') {
            escape = true;
            str += c;
        }
        else if (c === '"') {
            endLoc = i;
            break;
        }
        else {
            console.error('[KV] Unknown char:', c, i);
        }
    }
    return {
        start: start,
        end: endLoc,
        str: str
    };
}
function getList(arr, start, end) {
    if (arr[start] !== '{')
        return null;
    var list = [];
    var bracketCount = 0;
    var endLoc = end;
    // Get list range
    for (var i = start; i < end; i += 1) {
        var c = arr[i];
        if (c === '{') {
            bracketCount += 1;
        }
        else if (c === '}') {
            bracketCount -= 1;
            if (bracketCount === 0) {
                endLoc = i;
                break;
            }
            else if (bracketCount < 0) {
                console.error('[KV] Bracket not mapping');
                break;
            }
        }
    }
    // Parse kv list
    var kvObj;
    var myStart = start + 1;
    var myEnd = endLoc - 1;
    do {
        kvObj = getKV(arr, myStart, myEnd);
        if (kvObj) {
            list.push(kvObj.kv);
            myStart = kvObj.end + 1;
        }
    } while (kvObj);
    return {
        start: start,
        end: endLoc,
        list: list
    };
}
function getKV(arr, start, end) {
    var kv = new KV();
    kv._key = undefined;
    kv._value = undefined;
    var commentList = [];
    var startLoc = start;
    var endLoc = end;
    for (var i = start; i < end; i += 1) {
        if (isEmpty(arr, i))
            continue;
        // Comment
        var commentObj = getComment(arr, i, end);
        if (commentObj) {
            commentList.push(commentObj.comment);
            i = commentObj.end;
            continue;
        }
        // Key, value
        var strObj = getStr(arr, i, end);
        var listObj = getList(arr, i, end);
        if (kv.key === undefined) {
            if (strObj) {
                kv._key = strObj.str;
                startLoc = strObj.start;
                i = strObj.end;
            }
            else {
                console.error('[KV] key not mapping:', i, arr);
                break;
            }
        }
        else if (strObj || listObj) {
            if (strObj) {
                kv._value = strObj.str;
                endLoc = strObj.end;
            }
            else {
                kv._value = listObj.list;
                endLoc = listObj.end;
            }
            var connectCommentObj = getConnectComment(arr, endLoc + 1, end);
            if (connectCommentObj) {
                commentList.push(connectCommentObj.comment);
                endLoc = connectCommentObj.end;
            }
            break;
        }
        else {
            console.error('[KV] value not mapping:', i);
            break;
        }
    }
    if (kv.key === undefined || kv.value === undefined)
        return null;
    kv._comment = commentList.join('\n');
    return {
        kv: kv,
        start: startLoc,
        end: endLoc
    };
}
var KV = (function () {
    function KV(key, value, comment) {
        if (key === void 0) { key = ''; }
        if (value === void 0) { value = ''; }
        if (comment === void 0) { comment = ''; }
        this._key = key;
        this._value = value;
        this._comment = comment;
    }
    KV.parse = function (str, path) {
        var charList = Array.from(str);
        return getKV(charList, 0, charList.length).kv;
    };
    Object.defineProperty(KV.prototype, "isList", {
        get: function () {
            return Array.isArray(this.value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KV.prototype, "key", {
        get: function () {
            return this._key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KV.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KV.prototype, "comment", {
        get: function () {
            return this._comment;
        },
        enumerable: true,
        configurable: true
    });
    KV.prototype.clone = function () {
        return new KV(this.key, this.value, this.comment);
    };
    KV.prototype.getIndex = function (key) {
        if (!this.isList)
            return -1;
        if (typeof key === 'number') {
            if (!this.value[key])
                return -1;
            return key;
        }
        var myKey = String(key).toUpperCase();
        return this.value.findIndex(function (_a) {
            var _key = _a.key;
            return myKey === String(_key).toUpperCase();
        });
    };
    KV.prototype.getKV = function (path) {
        var myPath = Array.isArray(path) ? path : [path];
        if (myPath.length === 0)
            return this;
        var key = myPath[0], restPath = myPath.slice(1);
        var index = this.getIndex(key);
        if (index === -1)
            return undefined;
        return this.value[index].getKV(restPath);
    };
    KV.prototype.get = function (path) {
        var kv = this.getKV(path);
        return kv ? kv.value : undefined;
    };
    KV.prototype.setKey = function (val) {
        var kv = this.clone();
        kv._key = val;
        return kv;
    };
    KV.prototype.setValue = function (val) {
        var kv = this.clone();
        kv._value = val;
        return kv;
    };
    KV.prototype.setComment = function (val) {
        var kv = this.clone();
        kv._comment = val;
        return kv;
    };
    KV.prototype.set = function (path, val) {
        var _path = path;
        var _val = val;
        if (arguments.length === 1) {
            console.warn('[KV] Set accept 2 params with (path, value). If you want to set value, call setValue instead.');
            _path = [];
            _val = path;
        }
        var myPath = Array.isArray(_path) ? _path : [_path];
        if (myPath.length === 0)
            return this.setValue(_val);
        var key = myPath[0], restPath = myPath.slice(1);
        var index = this.getIndex(key);
        if (index === -1) {
            console.error('[KV] Path not found:', key, this.value);
            return this;
        }
        var kv = this.clone();
        kv._value = kv._value.concat();
        kv._value[index] = kv._value[index].set(restPath, _val);
        return kv;
    };
    KV.prototype.getPathValue = function (path) {
        return this.get(path);
    };
    KV.prototype.setPathValue = function (path, val) {
        return this.set(path, val);
    };
    KV.prototype.setPathKey = function (path, val) {
        var myPath = Array.isArray(path) ? path : [path];
        if (myPath.length === 0)
            return this.setKey(val);
        var key = myPath[0], restPath = myPath.slice(1);
        var index = this.getIndex(key);
        if (index === -1) {
            console.error('[KV] Path not found:', key, this.value);
            return this;
        }
        var kv = this.clone();
        kv._value = kv._value.concat();
        kv._value[index] = kv._value[index].setPathKey(restPath, val);
        return kv;
    };
    KV.prototype.setPathComment = function (path, val) {
        var myPath = Array.isArray(path) ? path : [path];
        if (myPath.length === 0)
            return this.setComment(val);
        var key = myPath[0], restPath = myPath.slice(1);
        var index = this.getIndex(key);
        if (index === -1) {
            console.error('[KV] Path not found:', key, this.value);
            return this;
        }
        var kv = this.clone();
        kv._value = kv._value.concat();
        kv._value[index] = kv._value[index].setPathComment(restPath, val);
        return kv;
    };
    return KV;
}());
exports["default"] = KV;
