import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import { ExternalStateConnector } from './external-state-connector';
import { EXTERNAL_STATE_LANDINGZONE } from '../repositories/landing-zone-repository';

const mockedPvGeneration = 'mockedPvGeneration';
const mockedTotalLoad = 'mockedTotalLoad';
const mockedBatterySoc = 'mockedBatterySoc';
const mockedSolarRadiaton = 'mockedSolarRadiation';
const mockedIsGridBuying = 'mockedIsGridBuying';
const mockedIsGridLoad = 'mockedIsGridLoad';
const mockedBatteryLoad = 'mockedBatteryLoad';

const mockedConfig: ioBroker.AdapterConfig = {
	optionUseInfluxDb: false,
	optionInstanceInfluxDb: 0,
	optionInstanceHistory: 0,
	optionEnergyManagementActive: true,
	optionSourcePvGeneration: mockedPvGeneration,
	optionSourceTotalLoad: mockedTotalLoad,
	optionSourceBatterySoc: mockedBatterySoc,
	optionSourceSolarRadiation: mockedSolarRadiaton,
	optionSourceIsGridBuying: mockedIsGridBuying,
	optionSourceIsGridLoad: mockedIsGridLoad,
	optionSourceBatteryLoad: mockedBatteryLoad,
};

const { adapter, database } = utils.unit.createMocks({});

describe('external-state-connector', () => {
	afterEach(() => {
		// The mocks keep track of all method invocations - reset them after each single test
		adapter.resetMockHistory();
		// We want to start each test with a fresh database
		database.clear();
	});

	describe('addSubscrptions', () => {
		[
			{ ext: mockedPvGeneration, int: EXTERNAL_STATE_LANDINGZONE.PV_GENERATION },
			{ ext: mockedTotalLoad, int: EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD },
			{ ext: mockedBatterySoc, int: EXTERNAL_STATE_LANDINGZONE.BAT_SOC },
			{ ext: mockedSolarRadiaton, int: EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION },
			{ ext: mockedIsGridBuying, int: EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING },
			{ ext: mockedIsGridLoad, int: EXTERNAL_STATE_LANDINGZONE.GRID_LOAD },
			{ ext: mockedBatteryLoad, int: EXTERNAL_STATE_LANDINGZONE.BAT_LOAD },
		].forEach(({ ext, int }) => {
			it(`should create subscription for ${ext}`, async () => {
				await ExternalStateConnector.create(adapter as unknown as AdapterInstance, mockedConfig);
				expect(adapter.subscribeForeignStates).to.calledWith(ext);
			});

			it(`change of '${ext}' updates '${int}'`, async () => {
				const asserts = utils.unit.createAsserts(database, adapter);

				const connector = await ExternalStateConnector.create(adapter as unknown as AdapterInstance, mockedConfig);

				const value = Math.random();
				connector.onSubscribedStateChanged(ext, value);

				asserts.assertStateHasValue(int, value);
			});
		});
	});
});
