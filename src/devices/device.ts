import { EnergyFlowManager } from '../services/energy-flow-manager';

export enum Status {
	MANUAL = 'MANUAL',
	STARTED = 'STARTED',
	STOPPED = 'STOPPED',
	FORCED = 'FORCED',
	LOCKED = 'LOCKED',
}

export interface Device {
	key: string,
}

export interface AutomatedDevice extends Device {
	priority: number,
	estimatedConsumption: Promise<number>,
	start: () => Promise<void>,
	stop: () => Promise<void>,
	forceStartNeeded: (efw: EnergyFlowManager) => Promise<boolean>,
	forceStopNeeded: (efw: EnergyFlowManager) => Promise<boolean>,
	status: Status,
	allowedBatteryConsumption: number
}