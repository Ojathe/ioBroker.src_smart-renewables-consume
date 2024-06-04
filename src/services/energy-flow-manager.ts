import {PowerRepository} from '../repositories/power-repository';
import {LandingZoneRepository} from '../repositories/landing-zone-repository';
import {EegRepository} from '../repositories/eeg-repository';
import {HeatingRepository} from '../repositories/heating-repository';
import {AutomatedDevice, Status} from '../devices/device';

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

		const direction = loss ? 'decrement' : 'increment';
		const amountOfUnbalance = await this.powerRepo.powerBalanceInternal.getValue();
		return await this.adjust(direction, amountOfUnbalance);

	};

	private adjust = async (direction: 'increment' | 'decrement', amount: number): Promise<Array<EnergyFlowManagerAdjustment>> => {

		console.log(`adjust(): ${direction} (balance: ${amount} kW)`);
		if (direction === 'decrement') {
			if (this.automatedDevices.length === 0) {
				return [];
			}

			const deviceCandidates = this.automatedDevices
				.filter((device) => (device.status === Status.STARTED))
				.sort((a, b) => a.priority <= b.priority ? 1 : -1);
			const deviceToStop = deviceCandidates[0];
			await deviceToStop.stop();

			return [{automatedDevice: deviceToStop, action: DeviceAction.STOPPED}];
		}

		throw new Error('Not Implemented');
	};
}