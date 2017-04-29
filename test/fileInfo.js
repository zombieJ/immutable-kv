import { assert } from 'chai';
import { KV, KVFileInfo } from '../js/index';

describe('KVFileInfo Test', () => {
	it('setKV', () => {
		const kv = new KV();
		const kv2 = new KV();
		const path = 'path1';
		const info = new KVFileInfo(kv, path);
		const u_info = info.setKV(kv2);

		assert.equal(info.kv, kv);
		assert.equal(u_info.kv, kv2);
		assert.equal(info.path, path);
		assert.equal(u_info.path, path);
	});

	it('setBase', () => {
		const subKV = new KV();
		const subPath = 'path13579';
		const subInfo = new KVFileInfo(subKV, subPath);
		const kv = new KV();
		const path = 'path233';
		const info = new KVFileInfo(kv, path, [subInfo]);

		{
			// Set by index
			const u_subInfo = new KVFileInfo(new KV(), 'not same');
			const u_info = info.setBase(0, u_subInfo);
			assert.equal(u_info.kv, kv);
			assert.equal(u_info.path, path);
			assert.equal(u_info.baseList[0], u_subInfo);
			assert.notEqual(u_info.baseList[0].path, subPath);
		}

		{
			// Set by KV
			const u_subInfo = new KVFileInfo(new KV(), 'not same');
			const u_info = info.setBase(subKV, u_subInfo);
			assert.equal(u_info.kv, kv);
			assert.equal(u_info.path, path);
			assert.equal(u_info.baseList[0], u_subInfo);
			assert.notEqual(u_info.baseList[0].path, subPath);
		}

		{
			// Set by KVFileInfo
			const u_subInfo = new KVFileInfo(new KV(), 'not same');
			const u_info = info.setBase(subInfo, u_subInfo);
			assert.equal(u_info.kv, kv);
			assert.equal(u_info.path, path);
			assert.equal(u_info.baseList[0], u_subInfo);
			assert.notEqual(u_info.baseList[0].path, subPath);
		}

		{
			// Set KV
			const u_subKV = new KV();
			const u_info = info.setBase(0, u_subKV);
			assert.equal(u_info.kv, kv);
			assert.equal(u_info.path, path);
			assert.equal(u_info.baseList[0].kv, u_subKV);
			assert.equal(u_info.baseList[0].path, subPath);
		}

		// Origin check
		assert.equal(info.kv, kv);
		assert.equal(info.path, path);
		assert.equal(info.baseList[0], subInfo);
		assert.equal(info.baseList[0].path, subPath);
	});
});
