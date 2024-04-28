import { Device } from './device';
import { ExtXidNumber } from '../values/extXId';

export interface HeatPumpConfig {
	sensors: {
		actualTemp: ExtXidNumber,
		targetTemp: ExtXidNumber
	};
	measurements: {
		load: ExtXidNumber,
		loadTotal: ExtXidNumber
	};
}

export interface HeatPump extends Device {
	actualTemp: () => Promise<number>,
	targetTemp: () => Promise<number>,
	load: () => Promise<number>,
	operating: () => Promise<boolean>,
	loadTotal: () => Promise<number>
}

export class HeatPumpImpl implements HeatPump {
	actualTemp: () => Promise<number>;
	load: () => Promise<number>;
	loadTotal: () => Promise<number>;
	targetTemp: () => Promise<number>;

	private constructor(private readonly config: HeatPumpConfig) {
		this.actualTemp = () => this.config.sensors.actualTemp.getValue();
		this.targetTemp = () => this.config.sensors.targetTemp.getValue();
		this.load = () => this.config.measurements.load.getValue();
		this.loadTotal = () => this.config.measurements.loadTotal.getValue();
	}

	static create = async (config: HeatPumpConfig): Promise<HeatPump> => {
		const pump = new HeatPumpImpl(config);

		return pump;
	};

	operating = async (): Promise<boolean> => {
		return (await this.load()) > 15;
	};

}

