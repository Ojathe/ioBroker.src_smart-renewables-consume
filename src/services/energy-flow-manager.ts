import { PowerRepository } from '../repositories/power-repository';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';
import { EegRepository } from '../repositories/eeg-repository';
import { HeatingRepository } from '../repositories/heating-repository';
import { AutomatedDevice } from '../devices/device';

export class EnergyFlowManager {

	constructor(private powerRepo: PowerRepository,
		private landingZoneRepo: LandingZoneRepository,
		private eegRepo: EegRepository,
		private heatingRepository: HeatingRepository,
		private automatedDevices: Array<AutomatedDevice>) {
	}

	public run = async (): Promise<boolean> => {

		const loss = await this.eegRepo.loss.getValue();
		const bonus = await this.eegRepo.bonus.getValue();
		const operating = await this.eegRepo.operating.getValue();

		if ((!loss && !bonus) || !operating) {
			return false;
		}

		return true;
	};
}