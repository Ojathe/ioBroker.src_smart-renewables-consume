import { Device } from './device';
import { ExtXidNumber } from '../values/extXId';

export interface VentilationUnitConfig {
	sensors: {
		fanSpeed: ExtXidNumber,
		tempExhaustAir: ExtXidNumber,
		tempExtractAir: ExtXidNumber,
		tempOutdoorAir: ExtXidNumber,
		tempSupplyAir: ExtXidNumber
		humidityValue: ExtXidNumber,
		co2Value: ExtXidNumber
	};
}

export interface VentilationUnit extends Device {

}