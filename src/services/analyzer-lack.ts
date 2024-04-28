import { PowerRepository } from '../repositories/power-repository';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';
import { EegRepository } from '../repositories/eeg-repository';

export class AnalyzerLack {
	// TODO move to config
	public static readonly lackReportingThreshold = -0.5;
	public static readonly gridBuyingThreshold = -0.2;

	constructor(private powerRepo: PowerRepository, private landingZoneRepo: LandingZoneRepository, private eegRepo: EegRepository) {
	}

	public async run(): Promise<void> {
		// TODO investigate on how to configure values
		// if (!this.adapter.config.optionEnergyManagementActive) {
		// 	console.log('Energy Management is not active.');
		// 	return;
		// }

		let powerLack = false;

		// Energy, missing (<0) oder additionally (>0) related to the household load
		const powerDifAvg5 = await this.powerRepo.avg5.powerBalance();
		const gridPowerAvg5 = await this.powerRepo.avg5.powerGrid();
		const batSoC = await this.landingZoneRepo.batterySoC.getValue();

		// TODO PV Connection
		// Mangel, wenn
		//	-> mindestens 2kW vom Stromnetz/AKku bezogen werden,
		//	-> der Akku weniger als 95% hat
		//	-> kaum bis keine Solarstrahlung existiert
		if (powerDifAvg5 < -1.9 && batSoC < 95) {
			powerLack = true;
		}

		// Mangel, wenn
		//	-> mindestens 1kW vom Stromnetz / Akku bezogen werden
		//	-> der Akkustand unterhalb von 60% ist
		if (powerDifAvg5 < -0.9 && batSoC < 60) {
			powerLack = true;
		}

		// Mangel, wenn
		//    -> mindestens 0,5kW vom Stromnetz / Akku bezogen werden
		//    -> der Akku unterhalb 30% ist
		if (powerDifAvg5 < -0.5 && batSoC < 30) {
			powerLack = true;
		}

		// Mangel, wenn
		//    -> überhaupt vom Stromnetz / Akku bezogen werden
		//    -> der Akku unterhalb 10% ist
		if (powerDifAvg5 < 0 && batSoC < 10) {
			powerLack = true;
		}

		// Mangel forcen, wenn vom Stromnetz genommen wird
		if (gridPowerAvg5 <= AnalyzerLack.gridBuyingThreshold) {
			powerLack = true;
		}

		const msg = `LackAnalysis # Lack GridPowerAvg5=${gridPowerAvg5} => PowerLack:${powerLack} SOC=${batSoC}`;
		const reportedLack = await this.eegRepo.loss.getValue();

		if (powerLack && !reportedLack) {
			console.log(msg + ' || STATE CHANGED');
		} else {
			console.debug(msg);
		}

		// Update the state
		await this.eegRepo.loss.setValue(powerLack);
	}
}
