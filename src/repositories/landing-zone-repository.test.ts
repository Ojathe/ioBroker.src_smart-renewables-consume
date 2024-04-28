import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import { EXTERNAL_STATE_LANDINGZONE, LandingZoneRepoImpl, LandingZoneRepository } from './landing-zone-repository';

const { adapter, database } = utils.unit.createMocks({});


describe('landing-zone-repository', () => {
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
	});

	describe('create Objects', () => {
		[
			EXTERNAL_STATE_LANDINGZONE.PV_GENERATION,
			EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD,
			EXTERNAL_STATE_LANDINGZONE.BAT_SOC,
			EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION,
			EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING,
			EXTERNAL_STATE_LANDINGZONE.GRID_LOAD,
			EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
		].forEach((testCase) => {
			it(`should create state for ${testCase}`, async () => {

				const asserts = utils.unit.createAsserts(database, adapter);

				await LandingZoneRepoImpl.create(adapter as unknown as AdapterInstance);

				// assert
				expect(adapter.setObjectNotExistsAsync).to.calledWith(testCase);
				expect(adapter.subscribeStates).to.calledWith(testCase);
				expect(adapter.setStateAsync).to.calledWith(testCase);

				asserts.assertStateExists(testCase);
			});
		});

		[
			[EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 'pvGeneration', 1],
			[EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 'totalLoad', 2],
			[EXTERNAL_STATE_LANDINGZONE.BAT_SOC, 'batterySoC', 3],
			[EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 'solarRadiation', 4],
			[EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, 'isGridBuying', true],
			[EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 'gridLoad', 5],
			[EXTERNAL_STATE_LANDINGZONE.BAT_LOAD, 'batLoad', 6],
		].forEach((testCase) => {

			const xid = testCase[0] as string;
			const expectedValue = testCase[2] as any;
			const expectedKey = testCase[1] as keyof LandingZoneRepository;
			it(`${xid} should be mapped to ${expectedKey}`, async () => {
				const asserts = utils.unit.createAsserts(database, adapter);
				const repo = await LandingZoneRepoImpl.create(adapter as unknown as AdapterInstance);

				await adapter.setStateAsync(xid, expectedValue, true);

				asserts.assertStateHasValue(xid, expectedValue);
				expect(await repo[expectedKey].getValue()).to.eq(expectedValue);

			});
		});
	});
});
