import { AdapterInstance } from '@iobroker/adapter-core';
import { PowerRepository } from '../repositories/power-repository';
import { INTERNAL_STATE_EEG } from '../handler/dp-handler';
import { getStateAsBoolean } from '../util/state-util';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';

export interface AnalyzerBonusProps {
	getSellingThreshold: () => number;
	getBonusReportThreshold: () => number;
	getBatChargeMinimum: () => number;
}

export interface AnalyzerBonusProps {

}

export class AnalyzerBonus {
	// TODO move to config
	public static readonly sellingThreshold: number = 0.2;
	public static readonly bonusReportThreshold: number = 0.1;
	public static readonly batChargeMinimum: number = 10;

	constructor(private adapter: AdapterInstance, private powerRepo: PowerRepository, private landingZoneRepo: LandingZoneRepository) {
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

		const reportedBonus = (await getStateAsBoolean(this.adapter, INTERNAL_STATE_EEG.BONUS)) ?? false;
		if (powerBonus && !reportedBonus) {
			console.log(msg + ' || STATE CHANGED');
		} else {
			console.debug(msg);
		}

		// update battery stand of charge
		if (powerBonus) {
			await this.adapter.setStateAsync(INTERNAL_STATE_EEG.SOC_LAST_BONUS, batSoC, true);
		}

		// Update the state
		await this.adapter.setStateAsync(INTERNAL_STATE_EEG.BONUS, powerBonus, true);
	}
}
