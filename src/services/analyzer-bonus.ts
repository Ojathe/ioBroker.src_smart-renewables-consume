import { PowerRepository } from '../repositories/power-repository';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';
import { EegRepository } from '../repositories/eeg-repository';

export interface AnalyzerBonusProps {
	getSellingThreshold: () => number;
	getBonusReportThreshold: () => number;
	getBatChargeMinimum: () => number;
}

export class AnalyzerBonus {
	// TODO move to config
	public static readonly sellingThreshold: number = 0.2;
	public static readonly bonusReportThreshold: number = 0.1;
	public static readonly batChargeMinimum: number = 10;

	constructor(private powerRepo: PowerRepository, private landingZoneRepo: LandingZoneRepository, private eegRepo: EegRepository) {
	}

	public async run(): Promise<void> {
		// TODO investigate on how to configure values
		// TODO PV Connection

		let powerBonus = false;

		// Energy, missing (<0) oder additionally (>0) related to the household load
		const powerDif = await this.powerRepo.current.powerBalance();
		const powerDifAvg = await this.powerRepo.avg.powerBalance();
		const gridPowerAvg = await this.powerRepo.avg.powerGrid();

		const batSoC = await this.landingZoneRepo.batterySoC.getValue();

		// bonus when positive power balance
		if (gridPowerAvg > AnalyzerBonus.sellingThreshold) {
			powerBonus = true;
		}

		// bonus when grid selling
		if (powerDifAvg > AnalyzerBonus.bonusReportThreshold) {
			powerBonus = true;
		}

		// no bonus, when battery is lower or the current power balance is negative
		if (batSoC <= AnalyzerBonus.batChargeMinimum || powerDif < 0) {
			powerBonus = false;
		}

		const msg = `BonusAnalysis # Bonus PowerDif=${powerDif} PowerDifAvg=${powerDifAvg} => powerBonus:${powerBonus} SOC=${batSoC}`;

		const reportedBonus = await this.eegRepo.bonus.getValue();
		if (powerBonus && !reportedBonus) {
			console.log(msg + ' || STATE CHANGED');
		} else {
			console.debug(msg);
		}

		// update battery stand of charge
		if (powerBonus) {
			await this.eegRepo.socLastBonus.setValue(batSoC);
		}

		// Update the state
		await this.eegRepo.bonus.setValue(powerBonus);
	}
}
