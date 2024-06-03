import { PowerRepository } from '../repositories/power-repository';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';
import { EegRepository } from '../repositories/eeg-repository';
import { sortBy } from '../util/array-helper';

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

	private batChargeThresholds: { threshold: number, chargeLoadSaving: number }[] = [
		{ threshold: 0, chargeLoadSaving: 3.5 },
		{ threshold: 20, chargeLoadSaving: 2.5 },
		{ threshold: 50, chargeLoadSaving: 1.5 },
		{ threshold: 75, chargeLoadSaving: 1 },
		{ threshold: 85, chargeLoadSaving: 0 },
	];

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

		const powerBalanceInternal = gridPowerAvg - this.getBatterySaving(batSoC);
		await this.powerRepo.powerBalanceInternal.setValue(powerBalanceInternal);

		// bonus when positive internal power balance
		if (powerBalanceInternal > AnalyzerBonus.sellingThreshold) {
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

	public getBatterySaving = (batSoc: number): number => {
		if (batSoc == 0) {
			return sortBy(this.batChargeThresholds, 'asc', (obj) => obj.threshold)[0].chargeLoadSaving;
		}

		const thresholdDef = [...this.batChargeThresholds].filter((obj) => {
			return obj.threshold < batSoc;
		}).pop();

		if (thresholdDef === undefined) {
			console.error(`Power Repository # ERROR Es konnte keine Grenzwertdefinition gefunden werden.`);
			return 0;
		}

		return thresholdDef.chargeLoadSaving;
	};


}
