import { AdapterInstance } from '@iobroker/adapter-core';
import { utils } from '@iobroker/testing';
import { expect } from 'chai';
import { addSubscriptions } from './dp-handler';

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
