import { AdapterInstance } from '@iobroker/adapter-core';
import { XidNumber } from './values/xid';

// TODO instance number and other values configurable
const customInflux = {
	'influxdb.0': {
		enabled: true,
		storageType: '',
		aliasId: '',
		debounceTime: 0,
		blockTime: 0,
		changesOnly: true,
		changesRelogInterval: 600,
		changesMinDelta: 0.1,
		ignoreBelowNumber: '',
		disableSkippedValueLogging: false,
		enableDebugLogs: false,
		debounce: '1000',
	},
};

// TODO instance number and other values configurable
const customHistory = {
	'history.0': {
		enabled: true,
		aliasId: '',
		debounceTime: 0,
		blockTime: 0,
		changesOnly: true,
		changesRelogInterval: 600,
		changesMinDelta: 0.1,
		ignoreBelowNumber: '',
		disableSkippedValueLogging: false,
		retention: 604800,
		customRetentionDuration: 365,
		maxLength: 960,
		enableDebugLogs: false,
		debounce: 1000,
	},
};

export class AverageValue {
	public readonly source?: XidNumber;
	public readonly propertyName: string;
	public readonly desc?: string;
	public readonly mutation?: (number: number) => Promise<number>;

	public readonly current: XidNumber;
	public readonly avg: XidNumber;
	public readonly avg5: XidNumber;

	private constructor(
		private adapter: AdapterInstance,
		propertyName: string,
		iobrokerObjects: { current: XidNumber, avg: XidNumber, avg5: XidNumber },
		props?: { source?: XidNumber; desc?: string; unit?: string; mutation?: (number: number) => Promise<number> },
	) {
		this.source = props?.source;
		this.propertyName = propertyName;
		this.desc = props?.desc;

		this.mutation = props?.mutation;

		if (!this.mutation && !this.source) {
			throw new Error(`${propertyName}: Es dürfen nicht xidSource UND Mutation undefniert sein!`);
		}

		this.current = iobrokerObjects.current;
		this.avg = iobrokerObjects.avg;
		this.avg5 = iobrokerObjects.avg5;
	}

	static async build(
		adapter: AdapterInstance,
		propertyName: string,
		props?: { xidSource?: string; desc?: string; unit?: string; mutation?: (number: number) => Promise<number> },
	): Promise<AverageValue> {

		const { desc, unit, mutation } = props ?? {};
		const source = props?.xidSource ? await XidNumber.asReadable(adapter, props?.xidSource) : undefined;

		const xid = `avg.${propertyName}.`;
		const description = props?.desc ?? propertyName;

		const iobrokerObjects = {
			current: await XidNumber.asManaged(adapter, xid + 'current', 0, {
				desc: description,
				unit: props?.unit,
				custom: customHistory,
			}),
			avg: await XidNumber.asManaged(adapter, xid + 'last-10-min', 0, {
				desc: `${description} der letzten 10 Minuten`,
				unit: props?.unit,
				custom: customInflux,
			}),

			avg5: await XidNumber.asManaged(adapter, xid + 'last-5-min', 0, {
				desc: `${description} der letzten 5 Minuten`,
				unit: props?.unit,
			}),
		};

		return new AverageValue(adapter, propertyName, iobrokerObjects, { desc, unit, mutation, source });
	}

}
