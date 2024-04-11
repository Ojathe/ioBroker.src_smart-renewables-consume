import { AdapterInstance } from '@iobroker/adapter-core';

export type AccessProps = { read: boolean; write: boolean };
export type CreateStateProps = { desc?: string; unit?: string; custom?: Record<string, any> };

export async function createObject<T extends ioBroker.StateValue>(
	context: AdapterInstance,
	name: string,
	typeName: ioBroker.CommonType,
	defaultValue: T,
	props?: CreateStateProps,
	accessProps: AccessProps = { read: true, write: true },
): Promise<void> {
	/*	For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
	await context.setObjectNotExistsAsync(name, {
		type: 'state',
		common: {
			name,
			type: typeName,
			role: 'indicator',
			desc: props?.desc,
			unit: props?.unit,
			read: accessProps.read,
			write: accessProps.write,
			custom: props?.custom,
		},
		native: {},
	});

	// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
	context.subscribeStates(name);
	// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
	// this.subscribeStates('lights.*');
	// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
	// this.subscribeStates('*');

	await context.setStateAsync(name, { val: defaultValue, ack: true });
}

export async function createObjectString(
	adapter: AdapterInstance,
	name: string,
	defaultValue = '',
	props?: CreateStateProps,
	accessProps?: AccessProps,
): Promise<void> {
	await createObject<string>(adapter, name, 'string', defaultValue, props, accessProps);
}

export async function createObjectBool(
	adapter: AdapterInstance,
	name: string,
	defaultValue = false,
	props?: CreateStateProps,
	accessProps?: AccessProps,
): Promise<void> {
	await createObject<boolean>(adapter, name, 'boolean', defaultValue, props, accessProps);
}

export async function createObjectNum(
	adapter: AdapterInstance,
	name: string,
	defaultValue = 0,
	props?: CreateStateProps,
	accessProps?: AccessProps,
): Promise<void> {
	await createObject<number>(adapter, name, 'number', defaultValue, props, accessProps);
}