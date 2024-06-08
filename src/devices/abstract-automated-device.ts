import { EnergyFlowManager } from '../services/energy-flow-manager';
import { AutomatedDevice, Status } from './device';

export abstract class AbstractAutomatedDevice implements AutomatedDevice {
	abstract priority: number;
	abstract estimatedConsumption: Promise<number>;
	abstract start: () => Promise<void>;
	abstract stop: () => Promise<void>;
	abstract forceStartNeeded: (efw: EnergyFlowManager) => Promise<boolean>;
	abstract forceStopNeeded: (efw: EnergyFlowManager) => Promise<boolean>;
	abstract status: Status;
	abstract allowedBatteryConsumption: number;
	abstract key: string;

	isAllowedToConsumeBattery({ batteryBalanceSinceBonus }: {
		batteryBalanceSinceBonus: number;
	}): boolean {
		if (this.allowedBatteryConsumption === 0) {
			return false;
		}

		if (batteryBalanceSinceBonus <= 0) {
			return true;
		}

		return Math.abs(batteryBalanceSinceBonus) <= this.allowedBatteryConsumption;

	}

}