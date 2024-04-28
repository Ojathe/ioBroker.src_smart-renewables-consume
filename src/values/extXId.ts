import { AdapterInstance } from '@iobroker/adapter-core';

export class ExtXId<T extends ioBroker.StateValue> {
	private isManaged: boolean = false;

	protected constructor(
		public readonly xid: string,
		private readonly adapter: AdapterInstance,
	) {
		if (adapter === undefined) {
			throw new Error('adapter has to be defined!');
		}
	}

	protected static async asManagedBase<T extends ioBroker.StateValue>(
		adapter: AdapterInstance,
		extXid: string,
		typeName: ioBroker.CommonType,
	): Promise<ExtXId<T>> {
		const instance = await ExtXId.asManagedBase<T>(adapter, extXid, typeName);
		instance.isManaged = true;
		return instance;
	}

	protected static async asReadableBase<T extends ioBroker.StateValue>(
		adapter: AdapterInstance,
		extXid: string,
		typeName: ioBroker.CommonType,
	): Promise<ExtXId<T>> {
		const state = await adapter.getForeignStateAsync(extXid);
		const object = await adapter.getForeignObjectAsync(extXid);

		if (!state || !object) {
			throw new Error(`Non existing foreign State '${extXid}'`);
		}

		if (object.common.type !== typeName) {
			throw new Error(`Mismatching type for foreign state  '${extXid}' (expected: ${typeName}, given: ${object.common.type})`);
		}
		return new ExtXId(extXid, adapter);
	}

	public getValue = async (): Promise<T> => {
		if (this.adapter === undefined) {
			throw new Error('adapter is not defined');
		}
		const state = await this.adapter.getForeignStateAsync(this.xid);

		if (state === undefined || state == null) {
			throw new Error('foreign state is not defined:' + this.xid);
		}

		if (state.val === undefined) {
			throw new Error('No value present in foreign state: ' + this.xid);
		}

		return state.val as T;
	};

	public async setValue(value: T): ioBroker.SetStatePromise {
		if (!this.isManaged) {
			throw new Error('Non managed xid\'s are not allowed to write values: ' + this.xid);
		}

		return this.adapter.setStateAsync(this.xid, value, true);
	}

}

export class ExtXidNumber extends ExtXId<number> {
	static async asReadable(adapter: AdapterInstance, xid: string): Promise<ExtXidNumber> {
		return ExtXId.asReadableBase<number>(adapter, xid, 'number');
	}

	static async asManaged(adapter: AdapterInstance, xid: string): Promise<ExtXidNumber> {
		return ExtXId.asManagedBase<number>(adapter, xid, 'number');
	}
}

export class ExtXidBool extends ExtXId<boolean> {
	static async asReadable(adapter: AdapterInstance, xid: string): Promise<ExtXidBool> {
		return ExtXId.asReadableBase<boolean>(adapter, xid, 'boolean');
	}

	static async asManaged(adapter: AdapterInstance, xid: string): Promise<ExtXidBool> {
		return ExtXId.asManagedBase<boolean>(adapter, xid, 'boolean');
	}
}