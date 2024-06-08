import { PowerRepository } from '../repositories/power-repository';
import { LandingZoneRepository } from '../repositories/landing-zone-repository';
import { EegRepository } from '../repositories/eeg-repository';
import { HeatingRepository } from '../repositories/heating-repository';
import { AutomatedDevice, Status } from '../devices/device';

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

		const amountOfUnbalance = await this.powerRepo.powerBalanceInternal.getValue();

		if (loss) {
			if (amountOfUnbalance < 0) {
				return await this.reduceLoad(amountOfUnbalance);
			}
			console.error('Unexpected State. Loss detected but amountOfUnbalance is positive!?');
		}

		if (bonus) {
			if (amountOfUnbalance > 0) {
				// TODO use average value for bonus
				return await this.increaseLoad(...);
			}
			console.error('Unexpected State. Bonus detected but amountOfUnbalance is negative!?');
		}

		return [];
	};

	private async reduceLoad(amount: number): Promise<Array<EnergyFlowManagerAdjustment>> {
		const absAmount = Math.abs(amount);
		if (this.automatedDevices.length === 0) {
			return [];
		}
		const deviceCandidates = this.getOrderedCandidatesToStop();
		const batteryBalance = await this.getBatteryStatus();

		let freedLoad = 0.0;
		const actions: Array<EnergyFlowManagerAdjustment> = [];

		for (const device of deviceCandidates) {
			if (freedLoad >= absAmount) {
				break; // balance is restored
			}

			if (device.isAllowedToConsumeBattery(batteryBalance)) {
				continue;
			}

			await device.stop();
			actions.push({ automatedDevice: device, action: DeviceAction.STOPPED });
			freedLoad += await device.estimatedConsumption;
		}

		return actions;
	}

	private async getBatteryStatus() {
		const batSoc = await this.landingZoneRepo.batterySoC.getValue();
		const bonusSoc = await this.eegRepo.socLastBonus.getValue();
		return {
			batteryBalanceSinceBonus: bonusSoc - batSoc,
		};
	}

	private getOrderedCandidatesToStop() {
		return this.automatedDevices
			.filter((device) => (device.status === Status.STARTED))
			.sort((a, b) => a.priority <= b.priority ? 1 : -1);
	}


	private async increaseLoad(amountOfUnbalance: number): Promise<Array<EnergyFlowManagerAdjustment>> {
		const candidates = this.getOrderedCandidatesToStart();

		if (candidates.length === 0) {
			return [];
		}

		candidates[0].start();
		return [{ automatedDevice: candidates[0], action: DeviceAction.STARTED }];

		throw new Error('Not Implemented');
	}

	private getOrderedCandidatesToStart() {
		return this.automatedDevices
			.filter((device) => (device.status === Status.STOPPED))
			.sort((a, b) => a.priority <= b.priority ? -1 : 1);
	}
}