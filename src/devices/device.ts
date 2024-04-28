import { EnergyFlowManager } from '../services/energy-flow-manager';

export interface Device {

}

export interface AutomatedDevice extends Device {
	priority: number,
	estimatedConsumption: Promise<number>,
	start: () => Promise<void>,
	stop: () => Promise<void>,
	forceStartNeeded: (efw: EnergyFlowManager) => Promise<boolean>,
	forceStopNeeded: (efw: EnergyFlowManager) => Promise<boolean>,
	automationSwitch: Promise<boolean>,
	allowedBatteryConsumption: number
}