import { Device } from './device';
import { ExtXidBool, ExtXidNumber } from '../values/extXId';

export interface SolarThermalConfig {
	sensors: {
		pumpOperating: ExtXidBool,
		pumpVoltage: ExtXidNumber,
		actualTemp: ExtXidNumber,
		targetTemp: ExtXidNumber
	};
}

export interface SolarThermal extends Device {
	temperatures: Array<Promise<number>>;
	isCold: Promise<boolean>;
	isHot: Promise<boolean>;
}