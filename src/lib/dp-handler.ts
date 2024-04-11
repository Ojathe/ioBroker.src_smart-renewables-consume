import { AdapterInstance } from '@iobroker/adapter-core';
import { createObjectBool, createObjectNum } from '../util/create-objects-helper';

export const XID_INGOING_PV_GENERATION = 'ingoing.pv-generation';
export const XID_INGOING_TOTAL_LOAD = 'ingoing.total-load';
export const XID_INGOING_BAT_SOC = 'ingoing.bat-soc';
export const XID_INGOING_SOLAR_RADIATION = 'ingoing.solar-radiation';
export const XID_INGOING_IS_GRID_BUYING = 'ingoing.is-grid-buying';
export const XID_INGOING_GRID_LOAD = 'ingoing.grid-load';
export const XID_INGOING_BAT_LOAD = 'ingoing.bat-load';

export const XID_EEG_STATE_BONUS = 'eeg-state.bonus';
export const XID_EEG_STATE_LOSS = 'eeg-state.loss';
export const XID_EEG_STATE_SOC_LAST_BONUS = 'eeg-state.soc-last-bonus';

export const XID_EEG_STATE_OPERATION = 'eeg-state.operation';

export const createObjects = async (adapter: AdapterInstance): Promise<void> => {
	await createObjectNum(adapter, XID_INGOING_PV_GENERATION, 0, {
		desc: 'The amount of power currently generated',
		unit: 'kWh',
	});

	await createObjectNum(adapter, XID_INGOING_TOTAL_LOAD, 0, {
		desc: 'The overall amount of currently consumend power',
		unit: 'kWh',
	});

	await createObjectNum(adapter, XID_INGOING_BAT_SOC, 0, {
		desc: 'The battery stand of charge',
		unit: '%',
	});

	await createObjectNum(adapter, XID_INGOING_SOLAR_RADIATION, 0, {
		desc: 'The Solar Radiation',
		unit: 'w\\m²',
	});

	await createObjectNum(adapter, XID_INGOING_GRID_LOAD, 0, {
		desc: 'The grids load',
		unit: 'kWh',
	});

	await createObjectNum(adapter, XID_INGOING_BAT_LOAD, 0, {
		desc: 'The battery load',
		unit: 'kWh',
	});

	await createObjectBool(adapter, XID_INGOING_IS_GRID_BUYING, false, {
		desc: 'True, if the System is buying energy from grid (external)',
	});
	// TODO Battery Power lg-ess-home.0.user.essinfo.common.BATT.dc_power

	await createObjectBool(adapter, XID_EEG_STATE_BONUS, false, {
		desc: 'True, if there is more Power then used',
	});

	await createObjectBool(adapter, XID_EEG_STATE_LOSS, false, {
		desc: 'True, if there is less Power then used',
	});

	await createObjectBool(adapter, XID_EEG_STATE_OPERATION, false, {
		desc: 'True, if the system should be managed',
	});

	await createObjectNum(adapter, XID_EEG_STATE_SOC_LAST_BONUS, 0, {
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
