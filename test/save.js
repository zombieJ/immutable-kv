import { assert, deepEqual } from 'chai';
import { KV, KVFileInfo } from '../js/index';

const PATH = require('path');

describe.only('KVFileInfo Save Test', () => {
	it('save', () => {
		const targetPath = PATH.resolve(__dirname, 'out/kv.txt');

		const promise = KV
			.baseLoad(PATH.resolve(__dirname, 'res/kv_base.txt'))
			.then((info) => {
				return info.save('utf8', targetPath);
			});

		return promise;
	});
});
