// ======================================================================
// =                             KVFileInfo                             =
// ======================================================================
export class KVFileInfo {
	_kv: KV;
	_path: string = '';
	_baseList: Array<KVFileInfo> = [];

	get kv(): KV {
		return this._kv;
	}

	get path(): string {
		return this._path;
	}

	get baseList():Array<KVFileInfo> {
		return this._baseList;
	}

	constructor(kv, path, baseList: Array<KVFileInfo> = []) {
		this._kv = kv;
		this._path = path;
		this._baseList = baseList;
	}

	clone(): KVFileInfo {
		return new KVFileInfo(this.kv, this.path, this.baseList.concat());
	}

	getBaseIndex(target: KV | KVFileInfo): number {
		let kv: KV;
		if (target instanceof KV) {
			kv = target;
		} else if (target instanceof KVFileInfo) {
			kv = target.kv;
		}

		return this.baseList.findIndex(info => info.kv === kv);
	}

	setKV(kv: KV): KVFileInfo {
		const info = this.clone();
		info._kv = kv;
		return info;
	}

	setBase(origin: number | KV | KVFileInfo, target: KV | KVFileInfo): KVFileInfo {
		const index = typeof origin === 'number' ? origin : this.getBaseIndex(origin);
		const oriBaseInfo = this.baseList[index];
		if (!oriBaseInfo) return this;

		let targetInfo: KVFileInfo;
		if (target instanceof KVFileInfo) {
			targetInfo = target;
		} else {
			targetInfo = oriBaseInfo.setKV(target);
		}
		const info = this.clone();
		info.baseList[index] = targetInfo;
		return info;
	}

	save(path) {
		const PATH = require('path');
		const myPath = path.resolve(path);
	}
}

	function isEmpty(arr, i) {
	const char = arr[i];
	if (['\t', ' ', '\r', '\n'].includes(char)) return true;
}

// ======================================================================
// =                                 KV                                 =
// ======================================================================
export interface BaseOption {
	encoding?: string,
	skipBase?: boolean,
	skipFail?: boolean,
}

function getComment(arr, start, end) {
	if (arr[start] !== '/' || arr[start + 1] !== '/') return null;

	let comment = '';
	let endLoc = end;

	for (let i = start + 2; i < end; i += 1) {
		const c = arr[i];
		if (c !== '\r' && c !== '\n') {
			comment += c;
		} else {
			endLoc = i - 1;
			break;
		}
	}

	return {
		start,
		end: endLoc,
		comment: comment.replace(/^\s/, ''),
	};
}

/***
 * Will check comment until new line
 * @param arr
 * @param start
 * @param end
 */
function getConnectComment(arr, start, end) {
	let commentObj = undefined;

	for (let i = start; i < end; i += 1) {
		const c = arr[i];
		if (c === '\r' || c === '\n') break;

		if (c === '/' && arr[i + 1] === '/') {
			commentObj = getComment(arr, i, end);
		} else if (c !== '\t' && c !== ' ') {
			break;
		}
	}

	return commentObj;
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
	kv._key = undefined;
	kv._value = undefined;
	const commentList = [];

	let startLoc = start;
	let endLoc = end;

	for (let i = start; i < end; i += 1) {
		if (isEmpty(arr, i)) continue;

		// Comment
		const commentObj = getComment(arr, i, end);
		if (commentObj) {
			commentList.push(commentObj.comment);
			i = commentObj.end;
			continue;
		}

		// Key, value
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
			const connectCommentObj = getConnectComment(arr, endLoc + 1, end);
			if (connectCommentObj) {
				commentList.push(connectCommentObj.comment);
				endLoc = connectCommentObj.end;
			}
			break;
		} else {
			console.error('[KV] value not mapping:', i);
			break;
		}
	}

	if (kv.key === undefined || kv.value === undefined) return null;

	kv._comment = commentList.join('\n');

	return {
		kv,
		start: startLoc,
		end: endLoc,
	};
}

const BASE_MATCH = /^\s*#base\s+"([^"]*)"/;
export class KV {
	_key: string;
	_value: string | Array<KV>;
	_comment: string;

	constructor(key: string = '', value: string | Array<KV> = '', comment: string = '') {
		this._key = key;
		this._value = value;
		this._comment = comment;
	}

	static parse(str: String | Array<String>): KV {
		const charList = Array.from(str);
		return getKV(charList, 0, charList.length).kv;
	}

	static baseLoad(path, option: BaseOption = {}): Promise<KVFileInfo> {
		const FS = require('fs');
		const PATH = require('path');
		const myPath = PATH.resolve(path);
		const { encoding = 'utf8', skipBase = false, skipFail = false } = option;

		return new Promise((resolve, reject) => {
			FS.readFile(myPath, encoding, (err, data) => {
				if (err) {
					reject(err);
					return;
				}
				const lines = data.split(/[\r\n]+/);
				const baseList = [];
				const charArr = lines.filter((line = '') => {
					const match = line.match(BASE_MATCH);
					if (match && match[1] !== undefined) {
						baseList.push(match[1]);
						return false;
					}
					return true;
				}).reduce((arr, line) => arr.concat(Array.from(line), '\n'), []);

				const kv = KV.parse(charArr);
				const kvFileInfo: KVFileInfo = new KVFileInfo(kv, myPath);

				if (skipBase) {
					resolve(kvFileInfo);
				} else {
					const dirName = PATH.dirname(myPath);
					const promiseList = baseList.map((basePath, index) => {
						const subPath = PATH.resolve(dirName, basePath);
						return KV.baseLoad(subPath, option).then((subKvFileInfo) => {
							kvFileInfo.baseList[index] = subKvFileInfo;
						}).catch((err) => {
							if (skipFail) {
								kvFileInfo.baseList[index] = new KVFileInfo(null, subPath);
								return Promise.resolve();
							}
							return Promise.reject(err);
						});
					});
					Promise.all(promiseList).then(() => {
						resolve(kvFileInfo);
					}, (err) => {
						reject(err);
					});
				}
			});
		});
	}

	static load(path, encoding = 'utf8'): Promise<KV> {
		return KV.baseLoad(path, { encoding, skipBase: true }).then(({ kv }) => kv);
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
		return (<Array<KV>>this.value).findIndex(({ key: _key }) => myKey === String(_key).toUpperCase());
	}

	getKV(path) {
		const myPath = Array.isArray(path) ? path : [path];
		if (myPath.length === 0) return this;

		const [key, ...restPath] = myPath;
		const index = this.getIndex(key);
		if (index === -1) return undefined;

		return (<KV>this.value[index]).getKV(restPath);
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

	setComment(val) {
		const kv = this.clone();
		kv._comment = val;
		return kv;
	}

	set(path, val) {
		let _path = path;
		let _val = val;

		if (arguments.length === 1) {
			console.warn('[KV] Set accept 2 params with (path, value). If you want to set value, call setValue instead.');
			_path = [];
			_val = path;
		}

		const myPath = Array.isArray(_path) ? _path : [_path];
		if (myPath.length === 0) return this.setValue(_val);

		const [key, ...restPath] = myPath;
		const index = this.getIndex(key);
		if (index === -1) {
			console.error('[KV] Path not found:', key, this.value);
			return this;
		}

		const kv = this.clone();
		kv._value = (<Array<KV>>kv._value).concat();
		kv._value[index] = kv._value[index].set(restPath, _val);

		return kv;
	}

	getPathValue(path) {
		return this.get(path);
	}

	setPathValue(path, val) {
		return this.set(path, val);
	}

	setPathKey(path, val) {
		const myPath = Array.isArray(path) ? path : [path];
		if (myPath.length === 0) return this.setKey(val);

		const [key, ...restPath] = myPath;
		const index = this.getIndex(key);
		if (index === -1) {
			console.error('[KV] Path not found:', key, this.value);
			return this;
		}

		const kv = this.clone();
		kv._value = (<Array<KV>>kv._value).concat();
		kv._value[index] = kv._value[index].setPathKey(restPath, val);

		return kv;
	}

	setPathComment(path, val) {
		const myPath = Array.isArray(path) ? path : [path];
		if (myPath.length === 0) return this.setComment(val);

		const [key, ...restPath] = myPath;
		const index = this.getIndex(key);
		if (index === -1) {
			console.error('[KV] Path not found:', key, this.value);
			return this;
		}

		const kv = this.clone();
		kv._value = (<Array<KV>>kv._value).concat();
		kv._value[index] = kv._value[index].setPathComment(restPath, val);

		return kv;
	}

	toTabString(tabCount: number = 0, tabWidth: number = 4, maxWidth: number = 0): string {
		const tabIndent = '\t'.repeat(tabCount);
		let str = '';

		// Comment
		if (this.comment) {
			str = this.comment.split('\n')
				.map(line => `${tabIndent}// ${line}`).join('\n');
			str += '\n';
		}

		// Key
		str += `${tabIndent}"${this.key}"`;

		if (this.isList) {
			str += ' {';

			const subList = <Array<KV>>this.value;
			const maxKeyLen = subList.reduce((maxLen, subKV) => {
				if (subKV.isList) return maxLen;
				return Math.max(maxLen, subKV.key.length);
			}, 0);

			if (subList.length) {
				str += subList
					.map(subKV => (
						`\n${subKV.toTabString(tabCount + 1, tabWidth, maxKeyLen)}`
					))
					.join('');

				str += `\n${tabIndent}}`;
			} else {
				str += '}';
			}
		} else {
			let desSpace = '\t';
			if (maxWidth > 0) {
				// Calculate length
				const totalWidth = Math.ceil((maxWidth + 2 + 1) / tabWidth) * tabWidth;

				const restWidth = totalWidth - this.key.length - 2;
				const kvTabCount = Math.ceil(restWidth / tabWidth);
				desSpace = '\t'.repeat(kvTabCount);
			}
			str += `${desSpace}"${this.value}"`;
		}

		return str;
	}

	toString(tabWidth: number = 4): string {
		return this.toTabString(0, tabWidth);
	}
}

export default KV;
