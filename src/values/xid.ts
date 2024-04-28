import { AdapterInstance } from '@iobroker/adapter-core';
import { createObject } from '../util/create-objects-helper';

export interface CreateXIdProps {
	access?: { read: boolean, write: boolean },
	desc?: string;
	unit?: string;
	custom?: Record<string, any>
}

export class XId<T extends ioBroker.StateValue> {
	protected constructor(
		public readonly xid: string,
		private readonly adapter: AdapterInstance,
		private readonly isManaged: boolean = false,
	) {
		if (adapter === undefined) {
			throw new Error('adapter has to be defined!');
		}
	}

	static async asManagedBase<T extends ioBroker.StateValue>(
		adapter: AdapterInstance,
		xid: string,
		typeName: ioBroker.CommonType,
		defaultValue: T,
		props: CreateXIdProps = {},
	): Promise<XId<T>> {
		const object = await adapter.getObjectAsync(xid);
		if (!object) {
			const { desc, unit, custom } = props;

			await createObject<T>(adapter, xid, typeName, defaultValue, {
				desc, unit, custom,
			}, props?.access);
		}
		const state = await adapter.getStateAsync(xid);
		if (!state) {
			throw new Error(`Non existing State '${xid}'`);
		}

		return new XId(xid, adapter, true);
	}

	protected static async asReadableBase<T extends ioBroker.StateValue>(
		adapter: AdapterInstance,
		xid: string,
		typeName: ioBroker.CommonType,
	): Promise<XId<T>> {
		const state = await adapter.getStateAsync(xid);
		const object = await adapter.getObjectAsync(xid);

		if (!state || !object) {
			throw new Error(`Non existing State '${xid}'`);
		}

		if (object.common.type !== typeName) {
			throw new Error(`Mismatching type for state  '${xid}' (expected: ${typeName}, given: ${object.common.type})`);
		}
		return new XId(xid, adapter);
	}

	public getValue = async (): Promise<T> => {
		if (this.adapter === undefined) {
			throw new Error('adapter is not defined');
		}
		const state = await this.adapter.getStateAsync(this.xid);
		if (state === undefined || state == null) {
			throw new Error('state is not defined:' + this.xid);
		}

		if (state.val === undefined) {
			throw new Error('No value present in state: ' + this.xid);
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

export class XidString extends XId<string> {
	static async asReadable(adapter: AdapterInstance, xid: string): Promise<XidString> {
		return XId.asReadableBase<string>(adapter, xid, 'string');
	}
}

export class XidBool extends XId<boolean> {
	static async asReadable(adapter: AdapterInstance, xid: string): Promise<XidBool> {
		return XId.asReadableBase<boolean>(adapter, xid, 'boolean');
	}
}

export class XidNumber extends XId<number> {
	static async asReadable(adapter: AdapterInstance, xid: string): Promise<XidNumber> {
		return XId.asReadableBase<number>(adapter, xid, 'number');
	}

	static async asManaged(adapter: AdapterInstance, xid: string, defaultValue: number = 0, props?: CreateXIdProps): Promise<XidNumber> {
		return XId.asManagedBase<number>(adapter, xid, 'number', defaultValue, props);
	}
}
