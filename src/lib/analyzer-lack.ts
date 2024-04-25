import { AdapterInstance } from '@iobroker/adapter-core';
import { AverageValueGroup } from './average-value-group';
import { EXTERNAL_STATE_LANDINGZONE, INTERNAL_STATE_EEG } from './dp-handler';

export class AnalyzerLack {
	// TODO move to config
	public static readonly lackReportingThreshold = -0.5;
	public static readonly gridBuyingThreshold = -0.2;

	constructor(private adapter: AdapterInstance, private avgValueHandler: AverageValueGroup) {
	}

	public async run(): Promise<void> {
		// TODO investigate on how to configure values
		// if (!this.adapter.config.optionEnergyManagementActive) {
		// 	console.log('Energy Management is not active.');
		// 	return;
		// }

		let powerLack = false;

		// Energy, missing (<0) oder additionally (>0) related to the household load
		const powerDifAvg5 = await this.avgValueHandler.powerDif.avg5.getValue();
		const gridPowerAvg5 = await this.avgValueHandler.powerGrid.avg5.getValue();
		const batSoc = ((await this.adapter.getStateAsync(EXTERNAL_STATE_LANDINGZONE.BAT_SOC))?.val as number) ?? 0;

		// TODO PV Connection
		// Mangel, wenn
		//	-> mindestens 2kW vom Stromnetz/AKku bezogen werden,
		//	-> der Akku weniger als 95% hat
		//	-> kaum bis keine Solarstrahlung existiert
		if (powerDifAvg5 < -1.9 && batSoc < 95) {
			powerLack = true;
		}

		// Mangel, wenn
		//	-> mindestens 1kW vom Stromnetz / Akku bezogen werden
		//	-> der Akkustand unterhalb von 60% ist
		if (powerDifAvg5 < -0.9 && batSoc < 60) {
			powerLack = true;
		}

		// Mangel, wenn
		//    -> mindestens 0,5kW vom Stromnetz / Akku bezogen werden
		//    -> der Akku unterhalb 30% ist
		if (powerDifAvg5 < -0.5 && batSoc < 30) {
			powerLack = true;
		}

		// Mangel, wenn
		//    -> überhaupt vom Stromnetz / Akku bezogen werden
		//    -> der Akku unterhalb 10% ist
		if (powerDifAvg5 < 0 && batSoc < 10) {
			powerLack = true;
		}

		// Mangel forcen, wenn vom Stromnetz genommen wird
		if (gridPowerAvg5 <= AnalyzerLack.gridBuyingThreshold) {
			powerLack = true;
		}

		const msg = `LackAnalysis # Lack GridPowerAvg5=${gridPowerAvg5} => PowerLack:${powerLack} SOC=${batSoc}`;
		const reportedLack: boolean = ((await this.adapter.getStateAsync(INTERNAL_STATE_EEG.LOSS))?.val as boolean) ?? false;

		if (powerLack && !reportedLack) {
			console.log(msg + ' || STATE CHANGED');
		} else {
			console.debug(msg);
		}

		// Update the state
		await this.adapter.setStateAsync(INTERNAL_STATE_EEG.LOSS, powerLack, true);
	}
}
