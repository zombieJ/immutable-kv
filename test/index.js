import { assert, deepEqual } from 'chai';
import KV from '../js/index';

describe('KV Operate Test', () => {
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

	it('getKV & get & getPathValue', () => {
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

		assert.equal(kv.getPathValue('l_1'), '111');
		assert.equal(kv.getPathValue('l_2'), kv_2.value);
		assert.equal(kv.get('l_3'), '333');
		assert.equal(kv.get(['l_1', 0]), undefined);
		assert.equal(kv.get(['l_2', 0]), '21');
		assert.equal(kv.get(['L_2', 1]), '22');
		assert.equal(kv.get([1, 'L_2_1']), '21');
		assert.equal(kv.get([1, 'l_2_2']), '22');
		assert.equal(kv.get([2, 'not exist']), undefined);
		assert.equal(kv.get('not exist'), undefined);
	});

	it('setKey', () => {
		const kv = new KV('aaa', 'bbb');
		const kv2 = kv.setKey('ccc');

		assert.equal(kv.key, 'aaa');
		assert.equal(kv2.key, 'ccc');
		assert.equal(kv.value, 'bbb');
		assert.equal(kv2.value, 'bbb');
	});

	it('setValue', () => {
		const kv = new KV('aaa', 'bbb');
		const kv2 = kv.setValue('ccc');

		assert.equal(kv.key, 'aaa');
		assert.equal(kv2.key, 'aaa');
		assert.equal(kv.value, 'bbb');
		assert.equal(kv2.value, 'ccc');
	});

	it('set || setPathValue', () => {
		const kv_1_1_0 = new KV('l_1_1_0', 'aaa');

		const kv_1_0 = new KV('l_1_0', '10');
		const list_1_1 = [kv_1_1_0];
		const kv_1_1 = new KV('l_1_1', list_1_1);

		const kv_0 = new KV('l_0', '000');
		const list_1 = [kv_1_0, kv_1_1];
		const kv_1 = new KV('l_1', list_1);

		const list = [kv_0, kv_1];
		const kv = new KV('root', list);

		const u_kv = kv.set([], '123');
		assert.equal(u_kv.value, '123');
		assert.equal(kv.value, list);

		const u_kv_0 = kv.set([0], 'test');
		assert.equal(u_kv_0.get([0]), 'test');
		assert.equal(kv.get([0]), '000');

		const u_kv_1 = kv.set(['L_1'], 'test2');
		assert.equal(u_kv_1.get([1]), 'test2');
		assert.equal(kv.get([1]), list_1);

		const u_kv_1_0 = kv.set(['l_1', 0], 'happy');
		assert.equal(u_kv_1_0.get([1, 0]), 'happy');
		assert.equal(kv.get([1, 0]), '10');

		const u_kv_1_1 = kv.set([1, 'l_1_1'], 'sad');
		assert.equal(u_kv_1_1.get([1, 1]), 'sad');
		assert.equal(kv.get([1, 1]), list_1_1);

		const u_kv_1_1_0 = kv.setPathValue([1, 1, 0], 'end');
		assert.equal(u_kv_1_1_0.get([1, 1, 0]), 'end');
		assert.equal(kv.get([1, 1, 'l_1_1_0']), 'aaa');
	});

	it('setPathKey', () => {
		const str1 = `"aaa""111"`;
		const kv1 = KV.parse(str1);
		const u_kv1 = kv1.setPathKey([], 'bbb');
		assert.equal(kv1.key, 'aaa');
		assert.equal(kv1.value, '111');
		assert.equal(u_kv1.key, 'bbb');
		assert.equal(u_kv1.value, '111');

		const str2 = `
		"l0"{
			"l0.0"{
				"l0.0.0" "233"
			}
		}
		
		`;
		const kv2 = KV.parse(str2);
		const u_kv2_0_0 = kv2.setPathKey('l0.0', 'l1.1');
		assert.equal(kv2.key, 'l0');
		assert.isUndefined(u_kv2_0_0.getPathValue('l0.0'));
		assert.isDefined(u_kv2_0_0.getPathValue('l1.1'));
		assert.isDefined(kv2.getPathValue('l0.0'));

		const u_kv2_0_0_0 = kv2.setPathKey(['l0.0', 'L0.0.0'], 'l1.1.1');
		assert.isDefined(kv2.getPathValue(['l0.0']));
		assert.isDefined(kv2.getPathValue(['l0.0', 'l0.0.0']));
		assert.isDefined(u_kv2_0_0_0.getPathValue(['l0.0']));
		assert.isDefined(u_kv2_0_0_0.getPathValue(['l0.0', 'l1.1.1']));
	});

	it('setPathComment', () => {
		const str1 = `"aaa"{
			"bbb" {
				"ccc" ""//233
			}
		}`;
		const kv1 = KV.parse(str1);
		const u_kv1 = kv1.setPathComment(['BBB', 'CCC'], 'good show');
		assert.equal(kv1.getKV(['BBB', 'CCC']).comment, '233');
		assert.equal(u_kv1.getKV(['BBB', 'CCC']).comment, 'good show');
	});
});
