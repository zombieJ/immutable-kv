import { assert, deepEqual } from 'chai';
import KV from '../js/index';
import path from 'path';

function normalPath(path) {
	return path.replace(/[\\/]/g, '|');
}

describe('KV Load Test', () => {
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

		const promise2 = KV
			.load(path.resolve(__dirname, 'res/kv_not_exist.txt'))
			.then(() => {
				throw 'File not exist. Should not resolve.';
			}, () => {});

		return Promise.all([promise1, promise2]);
	});

	it('load: base', () => {
		return KV
			.baseLoad(path.resolve(__dirname, 'res/kv_base.txt'))
			.then(({ kv, relativePath, baseList }) => {
				assert.equal(kv.key, 'root');
				assert.equal(kv.get('aaa'), '111');
				assert.equal(kv.get('bbb'), '222');

				const sub1_Info = baseList[0];
				const sub1_KV = sub1_Info.kv;
				const sub1_Path = normalPath(sub1_Info.path);
				assert.isTrue(sub1_Path.includes('res|next|kv1.txt'));
				assert.equal(sub1_KV.key, 'ccc');
				assert.equal(sub1_KV.get('ddd'), '');

				const sub2_Info = sub1_Info.baseList[0];
				assert.isDefined(sub2_Info);
				const sub2_KV = sub2_Info.kv;
				const sub2_Path = normalPath(sub2_Info.path);
				assert.isTrue(sub2_Path.includes('res|next|kv2.txt'));
				assert.equal(sub2_KV.key, 'eee');
				assert.equal(sub2_KV.get('fff'), '233');

				// Relative path
				assert.equal(relativePath);
				assert.equal(normalPath(sub1_Info.relativePath), 'next|kv1.txt');
				assert.equal(normalPath(sub2_Info.relativePath), 'kv2.txt');
			});
	});

	it('load: base - not exist', () => {
		return KV
			.baseLoad(path.resolve(__dirname, 'res/kv_base_not_exist.txt'))
			.then(() => {
				throw 'Base not exist should not resolve.';
			}, () => {});
	});

	it('load: base - skip fail', () => {
		return KV
			.baseLoad(path.resolve(__dirname, 'res/kv_base_not_exist.txt'), { skipFail: true })
			.catch(() => {
				throw 'Skip fail do not catch exception.';
			})
			.then(({ kv, baseList }) => {
				assert.equal(kv.key, 'root');
				assert.equal(kv.value, 'nice\\"try');

				const subPath = normalPath(baseList[0].path);
				assert.isTrue(subPath.includes('res|next|kv_not_exist.txt'));
				assert.isNull(baseList[0].kv);
			});
	});
});
