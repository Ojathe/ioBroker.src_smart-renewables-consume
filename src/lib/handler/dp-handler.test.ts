import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import { addSubscriptions, createObjects, EXTERNAL_STATE_LANDINGZONE, INTERNAL_STATE_EEG } from './dp-handler';

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

describe('dp-handler', () => {
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
			INTERNAL_STATE_EEG.BONUS,
			INTERNAL_STATE_EEG.LOSS,
			INTERNAL_STATE_EEG.SOC_LAST_BONUS,
			INTERNAL_STATE_EEG.OPERATION,
		].forEach((testCase) => {
			it(`should create state for ${testCase}`, async () => {
				const asserts = utils.unit.createAsserts(database, adapter);

				await createObjects(adapter as unknown as AdapterInstance);

				// assert
				expect(adapter.setObjectNotExistsAsync).to.calledWith(testCase);
				expect(adapter.subscribeStates).to.calledWith(testCase);
				expect(adapter.setStateAsync).to.calledWith(testCase);

				asserts.assertStateExists(testCase);
			});
		});
	});

	describe('addSubscrptions', () => {
		[
			mockedPvGeneration,
			mockedTotalLoad,
			mockedBatterySoc,
			mockedSolarRadiaton,
			mockedIsGridBuying,
			mockedIsGridLoad,
			mockedBatteryLoad,
		].forEach((testCase) => {
			it(`should create subscribition for ${testCase}`, async () => {
				addSubscriptions(adapter as unknown as AdapterInstance, mockedConfig);
				expect(adapter.subscribeForeignStates).to.calledWith(testCase);
			});
		});
	});
});
