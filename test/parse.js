import { assert, deepEqual } from 'chai';
import KV from '../js/index';

describe('KV Parse Test', () => {
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
});
