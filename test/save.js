import { assert, deepEqual } from 'chai';
import { KV } from '../js/index';

const FS = require('fs');
const PATH = require('path');

describe('KVFileInfo Save Test', () => {
	const DEL = require('del');
	DEL.sync(PATH.resolve(__dirname, 'out'));

	it('save', () => {
		const targetPath = PATH.resolve(__dirname, 'out/kv.txt');

		const promise = KV
			.baseLoad(PATH.resolve(__dirname, 'res/kv_base.txt'))
			.then((info) => {
				return info.save(targetPath);
			})
			.then(() => {
				assert.isTrue(FS.existsSync(PATH.resolve(__dirname, 'out')));
				assert.isTrue(FS.existsSync(PATH.resolve(__dirname, 'out/kv.txt')));
				assert.isTrue(FS.existsSync(PATH.resolve(__dirname, 'out/next/kv1.txt')));
				assert.isTrue(FS.existsSync(PATH.resolve(__dirname, 'out/next/kv2.txt')));
			});

		return promise;
	});
});
