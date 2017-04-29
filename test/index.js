import { assert, deepEqual } from 'chai';
import KV from '../js/index';
import path from 'path';

describe('KV Test', () => {
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
		assert.equal(kv1.key, 'aaa');
		assert.equal(kv1.value[0].key, 'bbb');
		assert.equal(kv1.value[0].value, 'ccc');

		const kv2 = KV.parse(`
		"root"{
			"aaa""111"
			
			"bbb" "222"
			
			"ccc" {
				"ddd"	"444""eee""555"
			}
		}
		`);
		assert.equal(kv2.key, 'root');
		assert.equal(kv2.getKV(0).key, 'aaa');
		assert.equal(kv2.getKV(0).value, '111');
		assert.equal(kv2.getKV(1).key, 'bbb');
		assert.equal(kv2.getKV(1).value, '222');
		assert.equal(kv2.getKV(2).key, 'ccc');
		assert.equal(kv2.get([2, 'DDD']), '444');
		assert.equal(kv2.get([2, 'eee']), '555');

		const kv3 = KV.parse(`"aaa"{
			"bbb" {
				"ccc" ""
			}
		}`);
		assert.equal(kv3.key, 'aaa');
		assert.equal(kv3.getKV(0).key, 'bbb');
	});

	it('parse: comment', () => {
		const str1 = `
				   // comment here
		"root"
		{}
		
		`;
		const kv1 = KV.parse(str1);
		assert.equal(kv1.key, 'root');
		assert.deepEqual(kv1.value, []);
		assert.equal(kv1.comment, 'comment here');

		const str2 = `// Hello
		\r\n\r\r\r\n
		//World
		"aaa"
		
		"bbb"`;
		const kv2 = KV.parse(str2);
		assert.equal(kv2.key, 'aaa');
		assert.deepEqual(kv2.value, 'bbb');
		assert.equal(kv2.comment, 'Hello\nWorld');

		const str3 = `
		"1"//test
		{
			"1.1"//nice
			// to
			"val:1.1"// meet you
		}
		`;
		const kv3 = KV.parse(str3);
		const kv3_0 = kv3.getKV(0);
		assert.equal(kv3.key, '1');
		assert.equal(kv3.comment, 'test');
		assert.equal(kv3_0.key, '1.1');
		assert.equal(kv3_0.value, 'val:1.1');
		assert.equal(kv3_0.comment, 'nice\nto\nmeet you');

		const str4 = `
		"a"//good
		{"b""2"//nice
"c""3""d"//bad
		"4"}
		`;
		const kv4 = KV.parse(str4);
		assert.equal(kv4.key, 'a');
		assert.equal(kv4.comment, 'good');
		assert.equal(kv4.getKV(['B']).value, '2');
		assert.equal(kv4.getKV(['B']).comment, 'nice');
		assert.equal(kv4.getKV([1]).key, 'c');
		assert.equal(kv4.getKV([1]).value, '3');
		assert.equal(kv4.getKV(['d']).value, '4');
		assert.equal(kv4.getKV(['d']).comment, 'bad');
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

	it('load', () => {
		const promise1 = KV
			.load(path.resolve(__dirname, 'res/kv.txt'))
			.then((kv) => {
				assert.equal(kv.key, 'DOTAAbilities');
				assert.equal(kv.comment, 'Dota Heroes File');
				assert.equal(kv.getKV([0]).key, 'Version');
				assert.equal(kv.getKV([0]).value, '1');

				const kv_a_unit = kv.getKV(['MyAbility_unit']);
				assert.equal(kv_a_unit.get('AbilityBehavior'), 'DOTA_ABILITY_BEHAVIOR_UNIT_TARGET');
				assert.equal(kv_a_unit.get('AbilityUnitTargetType'), 'DOTA_UNIT_TARGET_BASIC | DOTA_UNIT_TARGET_HERO');
				assert.equal(kv_a_unit.get(['OnSpellStart', 'TrackingProjectile', 'TARGET']), 'TARGET');
				assert.equal(kv_a_unit.get([
					'Modifiers', 'modifier_ability_unit_target',
					'OnCreated', 'Stun', 'Target', 'Center'
				]), 'TARGET');
			});

		return Promise.all([promise1]);
	});

	it.only('parse: base', () => {
		const promise1 = KV
			.load(path.resolve(__dirname, 'res/kv_base.txt'))
			.then((kv) => {});

		return promise1;
	});
});
