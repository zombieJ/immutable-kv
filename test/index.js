import { assert, deepEqual } from 'chai';
import KV from '../src/index';

describe('KV', () => {
	it('isList', () => {
		const kv1 = new KV('name', 'value');
		assert.equal(kv1.key, 'name');
		assert.equal(kv1.value, 'value');
		assert.isFalse(kv1.isList);

		const kv2 = new KV('tester', []);
		assert.equal(kv2.key, 'tester');
		assert.isTrue(kv2.isList);
	});

	it('getIndex', () => {
		const kv2_1 = new KV('lvl2_1', '111');
		const kv2_2 = new KV('lvl2_2', '222');
		const kv2_3 = new KV('lvl2_3', '333');
		const kv = new KV('lvl1', [kv2_1, kv2_2, kv2_3]);

		assert.equal(kv.getIndex(-1), -1);
		assert.equal(kv.getIndex(0), 0);
		assert.equal(kv.getIndex(1), 1);
		assert.equal(kv.getIndex(2), 2);
		assert.equal(kv.getIndex(3), -1);

		assert.equal(kv.getIndex('lvl2_1'), 0);
		assert.equal(kv.getIndex('LVL2_1'), 0);
		assert.equal(kv.getIndex('lvl2_2'), 1);
		assert.equal(kv.getIndex('LVL2_2'), 1);
		assert.equal(kv.getIndex('lvl2_3'), 2);
		assert.equal(kv.getIndex('LVL2_3'), 2);
		assert.equal(kv.getIndex('not exist'), -1);
	});

	it('getKV & get', () => {
		const kv_2_1 = new KV('l_2_1', '21');
		const kv_2_2 = new KV('l_2_2', '22');
		const kv_1 = new KV('l_1', '111');
		const kv_2 = new KV('l_2', [kv_2_1, kv_2_2]);
		const kv_3 = new KV('l_3', '333');
		const kv = new KV('root', [kv_1, kv_2, kv_3]);

		assert.equal(kv.getKV(-1), undefined);
		assert.equal(kv.getKV(0), kv_1);
		assert.equal(kv.getKV(1), kv_2);
		assert.equal(kv.getKV(2), kv_3);
		assert.equal(kv.getKV([0, 0]), undefined);
		assert.equal(kv.getKV([1, 0]), kv_2_1);
		assert.equal(kv.getKV([1, 1]), kv_2_2);
		assert.equal(kv.getKV([1, 2]), undefined);

		assert.equal(kv.getKV('l_1'), kv_1);
		assert.equal(kv.getKV('l_2'), kv_2);
		assert.equal(kv.getKV('l_3'), kv_3);
		assert.equal(kv.getKV(['l_1', 0]), undefined);
		assert.equal(kv.getKV(['l_2', 0]), kv_2_1);
		assert.equal(kv.getKV(['L_2', 1]), kv_2_2);
		assert.equal(kv.getKV([1, 'L_2_1']), kv_2_1);
		assert.equal(kv.getKV([1, 'l_2_2']), kv_2_2);
		assert.equal(kv.getKV([2, 'not exist']), undefined);
		assert.equal(kv.getKV('not exist'), undefined);

		assert.equal(kv.get(-1), undefined);
		assert.equal(kv.get(0), '111');
		assert.equal(kv.get(1), kv_2.value);
		assert.equal(kv.get(2), '333');
		assert.equal(kv.get([0, 0]), undefined);
		assert.equal(kv.get([1, 0]), '21');
		assert.equal(kv.get([1, 1]), '22');
		assert.equal(kv.get([1, 2]), undefined);

		assert.equal(kv.get('l_1'), '111');
		assert.equal(kv.get('l_2'), kv_2.value);
		assert.equal(kv.get('l_3'), '333');
		assert.equal(kv.get(['l_1', 0]), undefined);
		assert.equal(kv.get(['l_2', 0]), '21');
		assert.equal(kv.get(['L_2', 1]), '22');
		assert.equal(kv.get([1, 'L_2_1']), '21');
		assert.equal(kv.get([1, 'l_2_2']), '22');
		assert.equal(kv.get([2, 'not exist']), undefined);
		assert.equal(kv.get('not exist'), undefined);
	});

	it('parse: key - value', () => {
		const kv1 = KV.parse('"a""b"');
		assert.equal(kv1.key, 'a');
		assert.equal(kv1.value, 'b');

		const kv2 = KV.parse('"c"      "d"');
		assert.equal(kv2.key, 'c');
		assert.equal(kv2.value, 'd');

		const kv3 = KV.parse('"eee"			"fff"');
		assert.equal(kv3.key, 'eee');
		assert.equal(kv3.value, 'fff');
	});

	it('parse: key - list', () => {
		const kv1 = KV.parse('"aaa"{"bbb""ccc"}');
		assert.equal(kv1.key, "aaa");
		assert.equal(kv1.value[0].key, "bbb");
		assert.equal(kv1.value[0].value, "ccc");
	});
});