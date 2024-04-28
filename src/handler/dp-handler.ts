import { AdapterInstance } from '@iobroker/adapter-core';

export const addSubscriptions = (adapter: AdapterInstance, config: ioBroker.AdapterConfig): void => {
	adapter.subscribeForeignStates(config.optionSourcePvGeneration);
	adapter.subscribeForeignStates(config.optionSourceTotalLoad);
	adapter.subscribeForeignStates(config.optionSourceBatterySoc);
	adapter.subscribeForeignStates(config.optionSourceSolarRadiation);
	adapter.subscribeForeignStates(config.optionSourceIsGridBuying);
	adapter.subscribeForeignStates(config.optionSourceIsGridLoad);
	adapter.subscribeForeignStates(config.optionSourceBatteryLoad);
};
