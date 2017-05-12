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

	it('findIndex', () => {
		const kv2_1 = new KV('lvl2_1', '111');
		const kv2_2 = new KV('lvl2_2', '222');
		const kv2_3 = new KV('lvl2_3', '333');
		const kv = new KV('lvl1', [kv2_1, kv2_2, kv2_3]);

		assert.equal(kv.findIndex(-1), 2);
		assert.equal(kv.findIndex(0), 0);
		assert.equal(kv.findIndex(1), 1);
		assert.equal(kv.findIndex(2), 2);
		assert.equal(kv.findIndex(3), -1);

		assert.equal(kv.findIndex('lvl2_1'), 0);
		assert.equal(kv.findIndex('LVL2_1'), 0);
		assert.equal(kv.findIndex('lvl2_2'), 1);
		assert.equal(kv.findIndex('LVL2_2'), 1);
		assert.equal(kv.findIndex('lvl2_3'), 2);
		assert.equal(kv.findIndex('LVL2_3'), 2);
		assert.equal(kv.findIndex('not exist'), -1);
	});

	it('getKV & get & getPathValue', () => {
		const kv_2_1 = new KV('l_2_1', '21');
		const kv_2_2 = new KV('l_2_2', '22');
		const kv_1 = new KV('l_1', '111');
		const kv_2 = new KV('l_2', [kv_2_1, kv_2_2]);
		const kv_3 = new KV('l_3', '333');
		const kv = new KV('root', [kv_1, kv_2, kv_3]);

		assert.equal(kv.getKV(-1), kv_3);
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

		assert.equal(kv.get(-1), '333');
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

	it('update', () => {
		const kv = new KV('a', 'b');
		const kv2 = kv.update([], new KV('c', 'd'));

		assert.equal(kv.key, 'a');
		assert.equal(kv.value, 'b');
		assert.equal(kv2.key, 'c');
		assert.equal(kv2.value, 'd');

		const kv3 = KV.parse(`"root" {
			"aaa" "111"
			"bbb" {
				"ccc"{
					"ddd" "666"
				}
			}
		}`);
		const kv4 = kv3.update([1, 'ccc', 'ddd'], kv => kv.setValue('777'));
		assert.equal(kv3.get(['bbb', 'CcC', 'DDD']), '666');
		assert.equal(kv4.get(['bbb', 'CcC', 'DDD']), '777');

		const kv5 = KV.parse(`"root" {
			"a" "1"
		}`);
		const kv6 = kv5.update('a', kv => kv.setValue('111'));
		const kv7 = kv6.update('b', kv => kv.setValue('222'));
		assert.equal(kv7.get('a'), '111');
		assert.equal(kv7.get('b'), '222');
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

	it.only('set || setPathValue', () => {
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

		const kv2 = KV.parse(`"root" {
			"aaa" {
				"bbb" {
					"ccc" {}
				}
			}
		}`);
		const kv3 = kv.setPathValue(['aaa', 'bbb', 'ccc', 'ddd'], '233');
		assert.equal(kv2.get(['aaa', 'bbb', 'ccc', 'ddd']), undefined);
		assert.equal(kv3.get(['aaa', 'bbb', 'ccc', 'ddd']), '233');

		const kv4 = new KV('root', []);
		const kv5 = kv4.setPathValue(['a', 'b', 'c'], '333');
		assert.equal(kv4.get(['a', 'b', 'c']), undefined);
		assert.equal(kv5.get(['a', 'b', 'c']), '333');
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

	it('remove', () => {
		const kv = KV.parse(`
		"root" {
			"ddd" {
				"0" "0"
				"1" "1"
				"2" "2"
			}
		}`);
		const kv2 = kv.remove(['ddd', '1']);
		assert.equal(kv.get('ddd').length, 3);
		assert.equal(kv2.get('ddd').length, 2);
	});

	it('insert', () => {
		{
			const kv = KV.parse(`
			"root" {
				"aaa" "1111"
				"bbb" "2222"
			}
			`);
			const kv1 = kv.insert(0, new KV('sss', '000'));
			const kv2 = kv1.insert(-1, new KV('ccc', '3333'));
			assert.equal(kv.value.length, 2);
			assert.equal(kv1.value.length, 3);
			assert.equal(kv2.value.length, 4);
			assert.equal(kv.get(0), '1111');
			assert.equal(kv.get(['bbb']), '2222');
			assert.equal(kv2.getKV(0).key, 'sss');
			assert.equal(kv2.getKV(0).value, '000');
			assert.equal(kv2.getKV(3).key, 'ccc');
			assert.equal(kv2.getKV(3).value, '3333');
		}

		{
			const kv = KV.parse(`
				"111" {
					"222" {
						"333" {
							"a""1"
							"b""2"
							"c""3"
						}
					}
				}
			`);
			const kv1 = kv.insert(['222', '333', 0], new KV('s', '0'));
			const kv2 = kv1.insert(['222', '333', -1], new KV('d', '4'));
			assert.equal(kv.get(['222', '333']).length, 3);
			assert.equal(kv1.get(['222', '333']).length, 4);
			assert.equal(kv2.get(['222', '333']).length, 5);
		}
	});

	it('insert', () => {
		{
			const kv = KV.parse(`
			"root" {
				"0""0"
				"1""1"
				"2""2"
			}
			`);
			const kv2 = kv.switch(0, 2);
			assert.equal(kv.get(0), '0');
			assert.equal(kv.get(1), '1');
			assert.equal(kv.get(2), '2');
			assert.equal(kv2.get(0), '2');
			assert.equal(kv2.get(1), '1');
			assert.equal(kv2.get(2), '0');
		}

		{
			const kv = KV.parse(`
			"111" {
				"222"{
					"333" {
						"a" "0"
						"b" "1"
					}
				}
			}
			`);
			const kv2 = kv.switch([0, 0], 0, 1);
			assert.equal(kv.get([0, 0, 0]), '0');
			assert.equal(kv.get([0, 0, 1]), '1');
			assert.equal(kv2.get([0, 0, 0]), '1');
			assert.equal(kv2.get([0, 0, 1]), '0');
		}
	});
});
