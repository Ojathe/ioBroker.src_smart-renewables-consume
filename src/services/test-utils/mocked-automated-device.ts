import { AutomatedDevice, Status } from '../../devices/device';
import { EnergyFlowManager } from '../energy-flow-manager';

export interface MockedAutomatedDeviceProps {
	key: string,
	estimatedConsumption?: number,
	priority?: number,
	allowedBatteryConsumption?: number;
	status?: Status;
}

export class MockedAutomatedDevice implements AutomatedDevice {

	readonly priority: number;
	readonly estimatedConsumption: Promise<number>;
	readonly start: () => Promise<void>;
	readonly stop: () => Promise<void>;
	readonly forceStartNeeded: (efw: EnergyFlowManager) => Promise<boolean>;
	readonly forceStopNeeded: (efw: EnergyFlowManager) => Promise<boolean>;
	readonly status: Status;
	readonly allowedBatteryConsumption: number;
	readonly key: string;

	constructor(sandbox: sinon.SinonSandbox, props: MockedAutomatedDeviceProps) {
		this.start = sandbox.stub();
		this.stop = sandbox.stub();
		this.forceStartNeeded = sandbox.stub();
		this.forceStopNeeded = sandbox.stub();

		this.key = props.key;
		this.estimatedConsumption = Promise.resolve(props.estimatedConsumption ?? 0);
		this.priority = props.priority ?? 0;
		this.status = props.status ?? Status.MANUAL;
		this.allowedBatteryConsumption = props.allowedBatteryConsumption ?? 0;
	}

}