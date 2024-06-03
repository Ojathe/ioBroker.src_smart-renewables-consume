import { PowerRepository } from '../repositories/power-repository';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';
import { EegRepository } from '../repositories/eeg-repository';
import { HeatingRepository } from '../repositories/heating-repository';
import { AutomatedDevice } from '../devices/device';

export enum DeviceAction {
	STARTED = 'STARTED',
	STOPPED = 'STOPPED',
	FORCED = 'FORCED',
	LOCKED = 'LOCKED'
}

export interface EnergyFlowManagerAdjustment {
	automatedDevice: AutomatedDevice,
	action: DeviceAction
}

export class EnergyFlowManager {

	constructor(private powerRepo: PowerRepository,
		private landingZoneRepo: LandingZoneRepository,
		private eegRepo: EegRepository,
		private heatingRepository: HeatingRepository,
		private automatedDevices: Array<AutomatedDevice>) {
	}

	public run = async (): Promise<Array<EnergyFlowManagerAdjustment>> => {

		const loss = await this.eegRepo.loss.getValue();
		const bonus = await this.eegRepo.bonus.getValue();
		const operating = await this.eegRepo.operating.getValue();

		if ((!loss && !bonus) || !operating) {
			return [];
		}

		return this.adjust(loss ? 'decrement' : 'increment', await this.powerRepo.powerBalanceInternal.getValue());

	};

	private adjust = (direction: 'increment' | 'decrement', amount: number): Array<EnergyFlowManagerAdjustment> => {

		console.log(`adjust(): ${direction} (balance: ${amount} kW)`);
		if (direction === 'decrement') {
			return [];
		}

		throw new Error('Not Implemented');
	};
}