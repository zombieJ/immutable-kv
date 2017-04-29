import { assert, deepEqual } from 'chai';
import KV from '../js/index';

describe('KV toString Test', () => {
	it('toString: key - value', () => {
		const kv1 = new KV('aaa', '111');
		assert.equal(kv1.toString(), '"aaa"	"111"');
	});

	it('toString: key - list', () => {
		const str1 =
`"aaa" {
	"b"		"2"
	"cc"	"3"
}`;
		assert.equal(KV.parse(str1).toString(), str1);

		const str2 =
`"aaa" {
	"b"		"2"
	"cc"	"3"
	"ddd"	""
}`;
		assert.equal(KV.parse(str2).toString(), str2);

		const str3 =
`"aaa" {
	"b"		"2"
	"cc"	"3"
	"ddd"	""
	"eeee"	"5"
}`;
		assert.equal(KV.parse(str3).toString(), str3);

		const str4 =
`"aaa" {
	"b"		"2"
	"cc"	"3"
	"ddd"	""
	"eeee"	"5"
	"fffff"	"6"
}`;
		assert.equal(KV.parse(str4).toString(), str4);

		const str5 =
`"aaa" {
	"b"			"2"
	"cc"		"3"
	"ddd"		""
	"eeee"		"5"
	"fffff"		"6"
	"gggggg"	"7"
}`;
		assert.equal(KV.parse(str5).toString(), str5);

		const str6 =
`"aaa" {
	"b"	"2"
	"cc" {}
}`;
		assert.equal(KV.parse(str6).toString(), str6);

		const str7 =
`"aaa" {
	"b"	"2"
	"cc" {
		"d"	"4"
	}
}`;
		assert.equal(KV.parse(str7).toString(), str7);

		const str8 =
`"aaa" {
	"b"	"2"
	"cc" {
		"d"	"444"
		"eeeee" {
			"ff"	"1128"
			"ggg"	"0903"
			"sdddddddd" {
				"nice"	""
				"bad"	"good"
			}
		}
	}
}`;
		assert.equal(KV.parse(str8).toString(), str8);
	});
});
