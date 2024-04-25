import { AdapterInstance } from '@iobroker/adapter-core';
import { createObjectBool, createObjectNum } from '../../util/create-objects-helper';

export const EXTERNAL_STATE_LANDINGZONE = {
	PV_GENERATION: 'ingoing.pv-generation',
	TOTAL_LOAD: 'ingoing.total-load',
	BAT_SOC: 'ingoing.bat-soc',
	SOLAR_RADIATION: 'ingoing.solar-radiation',
	IS_GRID_BUYING: 'ingoing.is-grid-buying',
	GRID_LOAD: 'ingoing.grid-load',
	BAT_LOAD: 'ingoing.bat-load',
};

export const INTERNAL_STATE_EEG = {
	BONUS: 'eeg-state.bonus',
	LOSS: 'eeg-state.loss',
	SOC_LAST_BONUS: 'eeg-state.soc-last-bonus',
	OPERATION: 'eeg-state.operation',
};

export const createObjects = async (adapter: AdapterInstance): Promise<void> => {
	await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 0, {
		desc: 'The amount of power currently generated',
		unit: 'kWh',
	});

	await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 0, {
		desc: 'The overall amount of currently consumend power',
		unit: 'kWh',
	});

	await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_SOC, 0, {
		desc: 'The battery stand of charge',
		unit: '%',
	});

	await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 0, {
		desc: 'The Solar Radiation',
		unit: 'w\\m²',
	});

	await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0, {
		desc: 'The grids load',
		unit: 'kWh',
	});

	await createObjectNum(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD, 0, {
		desc: 'The battery load',
		unit: 'kWh',
	});

	await createObjectBool(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false, {
		desc: 'True, if the System is buying energy from grid (external)',
	});
	// TODO Battery Power lg-ess-home.0.user.essinfo.common.BATT.dc_power

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
