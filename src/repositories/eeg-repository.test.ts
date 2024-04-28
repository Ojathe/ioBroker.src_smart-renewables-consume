import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import { EegRepositoryImpl, INTERNAL_STATE_EEG } from './eeg-repository';

const { adapter, database } = utils.unit.createMocks({});


describe('landing-zone-repository', () => {
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
	});

	describe('create', () => {
		[
			INTERNAL_STATE_EEG.BONUS,
			INTERNAL_STATE_EEG.LOSS,
			INTERNAL_STATE_EEG.SOC_LAST_BONUS,
			INTERNAL_STATE_EEG.OPERATION,
		].forEach((testCase) => {
			it(`should create state for ${testCase}`, async () => {

				const asserts = utils.unit.createAsserts(database, adapter);

				await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);

				// assert
				expect(adapter.setObjectNotExistsAsync).to.calledWith(testCase);
				expect(adapter.subscribeStates).to.calledWith(testCase);
				expect(adapter.setStateAsync).to.calledWith(testCase);

				asserts.assertStateExists(testCase);
			});
		});

		[
			[INTERNAL_STATE_EEG.BONUS, 'bonus', true],
			[INTERNAL_STATE_EEG.LOSS, 'loss', true],
			[INTERNAL_STATE_EEG.OPERATION, 'operating', true],
		].forEach((testCase) => {

			const xid = testCase[0] as string;
			const expectedValue = testCase[2] as boolean;
			const expectedKey = testCase[1] as keyof EegRepositoryImpl;
			it(`${xid} should be mapped to ${expectedKey}`, async () => {
				const asserts = utils.unit.createAsserts(database, adapter);
				const repo = await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);

				await adapter.setStateAsync(xid, expectedValue, true);

				asserts.assertStateHasValue(xid, expectedValue);
				expect(await repo[expectedKey].getValue()).to.eq(expectedValue);

			});

			it(`${expectedKey} can be written`, async () => {
				const asserts = utils.unit.createAsserts(database, adapter);
				const repo = await EegRepositoryImpl.create(adapter as unknown as AdapterInstance);

				await adapter.setStateAsync(xid, !expectedValue, true);
				asserts.assertStateHasValue(xid, !expectedValue);

				await repo[expectedKey].setValue(expectedValue as unknown as never);
				asserts.assertStateHasValue(xid, expectedValue);

			});
		});
	});
});
