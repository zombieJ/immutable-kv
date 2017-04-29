import { assert, deepEqual } from 'chai';
import KV from '../js/index';
import path from 'path';

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
			})
			.catch(() => {});

		return Promise.all([promise1, promise2]);
	});

	it('load: base', () => {
		const promise1 = KV
			.baseLoad(path.resolve(__dirname, 'res/kv_base.txt'))
			.then(({ kv, baseList }) => {
				assert.equal(kv.key, 'root');
				assert.equal(kv.get('aaa'), '111');
				assert.equal(kv.get('bbb'), '222');

				const subKV = baseList[0].kv;
				const subPath = baseList[0].path.replace(/\\/g, '|');
				assert.isTrue(subPath.includes('res|next|kv1.txt'));
				assert.equal(subKV.key, 'ccc');
				assert.equal(subKV.get('ddd'), '');
			});

		const promise2 = KV
			.baseLoad(path.resolve(__dirname, 'res/kv_base_not_exist.txt'))
			.then(() => {
				throw 'Base not exist should not resolve.';
			}, () => {});

		const promise3 = KV
			.baseLoad(path.resolve(__dirname, 'res/kv_base_not_exist.txt'), { skipFail: true })
			.then(({ kv, baseList }) => {
				assert.equal(kv.key, 'root');
				assert.equal(kv.value, '');

				const subPath = baseList[0].path.replace(/\\/g, '|');
				assert.isTrue(subPath.includes('res|next|kv2.txt'));
				assert.isNull(baseList[0].kv);
			})
			.catch(() => {
				throw 'Skip fail do not catch exception.';
			});

		return Promise.all([promise1, promise2, promise3]);
	});
});
