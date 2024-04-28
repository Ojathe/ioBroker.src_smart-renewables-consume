import { AdapterInstance } from '@iobroker/adapter-core';
import { createObjectBool, createObjectNum } from '../util/create-objects-helper';


export const INTERNAL_STATE_EEG = {
	BONUS: 'eeg-state.bonus',
	LOSS: 'eeg-state.loss',
	SOC_LAST_BONUS: 'eeg-state.soc-last-bonus',
	OPERATION: 'eeg-state.operation',
};

export const createObjects = async (adapter: AdapterInstance): Promise<void> => {
	await createObjectBool(adapter, INTERNAL_STATE_EEG.BONUS, false, {
		desc: 'True, if there is more Power then used',
	});

	await createObjectBool(adapter, INTERNAL_STATE_EEG.LOSS, false, {
		desc: 'True, if there is less Power then used',
	});

	await createObjectBool(adapter, INTERNAL_STATE_EEG.OPERATION, false, {
		desc: 'True, if the system should be managed',
	});

	await createObjectNum(adapter, INTERNAL_STATE_EEG.SOC_LAST_BONUS, 0, {
		desc: 'Batteries SoC when the last Bonus was detected',
	});
};

export const addSubscriptions = (adapter: AdapterInstance, config: ioBroker.AdapterConfig): void => {
	adapter.subscribeForeignStates(config.optionSourcePvGeneration);
	adapter.subscribeForeignStates(config.optionSourceTotalLoad);
	adapter.subscribeForeignStates(config.optionSourceBatterySoc);
	adapter.subscribeForeignStates(config.optionSourceSolarRadiation);
	adapter.subscribeForeignStates(config.optionSourceIsGridBuying);
	adapter.subscribeForeignStates(config.optionSourceIsGridLoad);
	adapter.subscribeForeignStates(config.optionSourceBatteryLoad);
};
