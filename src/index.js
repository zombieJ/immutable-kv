function isEmpty(arr, i) {
	const char = arr[i];
	if (['\t', ' ', '\r', '\n'].includes(char)) return true;
}

function getStr(arr, start, end) {
	if (arr[start] !== '"') return null;
	let str = '';
	let escape = false;
	let endLoc = end;

	for (let i = start + 1; i < end; i += 1) {
		const c = arr[i];

		if (escape || (c !== '"' && c !== '\\')) {
			escape = false;
			str += c;
		} else if (c === '\\') {
			escape = true;
			str += c;
		} else if (c === '"') {
			endLoc = i;
			break;
		} else {
			console.error('[KV] Unknown char:', c, i);
		}
	}

	return {
		start,
		end: endLoc,
		str,
	};
}

function getList(arr, start, end) {
	if (arr[start] !== '{') return null;

	const list = [];
	let bracketCount = 0;
	let endLoc = end;

	// Get list range
	for (let i = start; i < end; i += 1) {
		const c = arr[i];
		if (c === '{') {
			bracketCount += 1;
		} else if (c === '}') {
			bracketCount -= 1;
			if (bracketCount === 0) {
				endLoc = i;
				break;
			} else if (bracketCount < 0) {
				console.error('[KV] Bracket not mapping');
				break;
			}
		}
	}

	// Parse kv list
	let kvObj;
	let myStart = start + 1;
	const myEnd = endLoc - 1;
	do {
		kvObj = getKV(arr, myStart, myEnd);
		if (kvObj) {
			list.push(kvObj.kv);
			myStart = kvObj.end + 1;
		}
	} while (kvObj);


	return {
		start,
		end: endLoc,
		list,
	};
}

function getKV(arr, start, end) {
	const kv = new KV();
	let startLoc = start;
	let endLoc = end;

	for (let i = start; i < end; i += 1) {
		if (isEmpty(arr, i)) continue;

		const strObj = getStr(arr, i, end);
		const listObj = getList(arr, i, end);

		if (kv.key === undefined) {
			if (strObj) {
				kv._key = strObj.str;
				startLoc = strObj.start;
				i = strObj.end;
			} else {
				console.error('[KV] key not mapping:', i, arr);
				break;
			}
		} else if (strObj || listObj) {
			if (strObj) {
				kv._value = strObj.str;
				endLoc = strObj.end;
			} else {
				kv._value = listObj.list;
				endLoc = listObj.end;
			}
			break;
		} else {
			console.error('[KV] value not mapping:', i);
			break;
		}
	}

	if (!kv.key || !kv.value) return null;

	return {
		kv,
		start: startLoc,
		end: endLoc,
	};
}

class KV {
	constructor(key, value, comment) {
		this._key = key;
		this._value = value;
		this._comment = comment;
	}

	static parse(str, path) {
		const charList = Array.from(str);
		return getKV(charList, 0, charList.length).kv;
	}

	get isList() {
		return Array.isArray(this.value);
	}

	get key() {
		return this._key;
	}

	get value() {
		return this._value;
	}

	get comment() {
		return this._comment;
	}

	clone() {
		return new KV(this.key, this.value, this.comment);
	}

	getIndex(key) {
		if (!this.isList) return -1;

		if (typeof key === 'number') {
			if (!this.value[key]) return -1;
			return key;
		}

		const myKey = String(key).toUpperCase();
		return this.value.findIndex(({ key: _key }) => myKey === String(_key).toUpperCase());
	}

	getKV(path) {
		const myPath = Array.isArray(path) ? path : [path];
		if (myPath.length === 0) return this;

		const [key, ...restPath] = myPath;
		const index = this.getIndex(key);
		if (index === -1) return undefined;

		return this.value[index].getKV(restPath);
	}

	get(path) {
		const kv = this.getKV(path);
		return kv ? kv.value : undefined;
	}

	setKey(val) {
		const kv = this.clone();
		kv._key = val;
		return kv;
	}

	setValue(val) {
		const kv = this.clone();
		kv._value = val;
		return kv;
	}

	set(path, val) {
		const myPath = Array.isArray(path) ? path : [path];
		if (myPath.length === 0) return this.setValue(val);

		const [key, ...restPath] = myPath;
		const index = this.getIndex(key);
		if (index === -1) {
			console.error('[KV] Path not found:', key, this.value);
			return this;
		}

		const kv = this.clone();
		kv._value = kv._value.concat();
		kv._value[index] = kv._value[index].set(restPath, val);

		return kv;
	}
}

export default KV;