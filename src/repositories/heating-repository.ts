import { VentilationUnit, VentilationUnitConfig } from '../devices/ventilation-unit';
import { HeatPump, HeatPumpConfig, HeatPumpImpl } from '../devices/heat-pump';
import { BufferConfig } from '../devices/buffer';
import { SolarThermalConfig } from '../devices/solar-thermal';
import { AdapterInstance } from '@iobroker/adapter-core';

export interface HeatingRepositoryConfig {
	bufferConfig?: BufferConfig,
	solarThermalConfig?: SolarThermalConfig,
	venitlationUnitConfig?: VentilationUnitConfig,
	heatPumpConfig?: HeatPumpConfig
}

export class HeatingRepository {
	constructor() {
	}

	private _buffer: Buffer | undefined;

	get buffer(): Buffer | undefined {
		return this._buffer;
	}

	private _solarThermal: Buffer | undefined;

	get solarThermal(): Buffer | undefined {
		return this._solarThermal;
	}

	private _ventilationUnit: VentilationUnit | undefined;

	get ventilationUnit(): VentilationUnit | undefined {
		return this._ventilationUnit;
	}

	private _heatPump: HeatPump | undefined;

	get heatPump(): HeatPump | undefined {
		return this._heatPump;
	}

	static async create(adapter: AdapterInstance, config: HeatingRepositoryConfig): Promise<HeatingRepository> {

		const repo = new HeatingRepository();
		if (config.heatPumpConfig) {
			repo._heatPump = await HeatPumpImpl.create(config.heatPumpConfig);
		}

		return repo;
	}
}