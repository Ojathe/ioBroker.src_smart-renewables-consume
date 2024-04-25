/*
 * Created with @iobroker/create-adapter v2.6.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import { scheduleJob } from 'node-schedule';
import { AnalyzerLack } from './lib/analyzer-lack';
import { AnalyzerBonus } from './lib/analyzer-bonus';
import { AverageValueGroup } from './lib/average-value-group';
import { addSubscriptions, createObjects, EXTERNAL_STATE_LANDINGZONE, INTERNAL_STATE_EEG } from './lib/dp-handler';
import { setStateAsBoolean } from './lib/util/state-util';

// Load your modules here, e.g.:
// import * as fs from "fs";

class SrcSmartRenewablesConsume extends utils.Adapter {
	private avgValueHandler: AverageValueGroup | undefined;
	private analyzerBonus: AnalyzerBonus | undefined;
	private analyzerLack: AnalyzerLack | undefined;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'src_smart-renewables-consume',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// TODO make sure that adapter will be restarted after config change
		this.log.debug('config ' + this.config);

		await createObjects(this);

		addSubscriptions(this, this.config);

		await setStateAsBoolean(this, INTERNAL_STATE_EEG.OPERATION, this.config.optionEnergyManagementActive);

		// TODO Work in progress
		const configToMap = [
			this.config.optionSourcePvGeneration,
			this.config.optionSourceBatterySoc,
			this.config.optionSourceIsGridBuying,
			this.config.optionSourceIsGridLoad,
			this.config.optionSourceSolarRadiation,
			this.config.optionSourceTotalLoad,
			this.config.optionSourceBatteryLoad,
		];

		for (const externalId of configToMap) {
			console.debug('initializing: ' + externalId);
			await this.updateIngoingValue(externalId);
		}

		this.avgValueHandler = await AverageValueGroup.build(this);
		this.analyzerBonus = new AnalyzerBonus(this, this.avgValueHandler);
		this.analyzerLack = new AnalyzerLack(this, this.avgValueHandler);

		// calculating average Values
		// TODO make interval configurable
		scheduleJob('*/20 * * * * *', () => {
			console.debug('calculating average Values');
			this.avgValueHandler!.calculate();
		});

		scheduleJob('*/30 * * * * *', () => {
			console.debug('C H E C K I N G   F O R   B O N U S  /  L A C K');
			this.analyzerBonus!.run();
			this.analyzerLack!.run();
		});
	}

	// private async onReady(): Promise<void> {
	// 	// Initialize your adapter here
	//
	// 	// The adapters config (in the instance object everything under the attribute "native") is accessible via
	// 	// this.config:
	// 	this.log.info('config option1: ' + this.config.option1);
	// 	this.log.info('config option2: ' + this.config.option2);
	//
	// 	/*
	// 	For every state in the system there has to be also an object of type state
	// 	Here a simple template for a boolean variable named "testVariable"
	// 	Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
	// 	*/
	// 	await this.setObjectNotExistsAsync('testVariable', {
	// 		type: 'state',
	// 		common: {
	// 			name: 'testVariable',
	// 			type: 'boolean',
	// 			role: 'indicator',
	// 			read: true,
	// 			write: true,
	// 		},
	// 		native: {},
	// 	});
	//
	// 	// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
	// 	// this.subscribeStates('testVariable');
	// 	// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
	// 	// this.subscribeStates('lights.*');
	// 	// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
	// 	// this.subscribeStates('*');
	//
	// 	/*
	// 		setState examples
	// 		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
	// 	*/
	// 	// the variable testVariable is set to true as command (ack=false)
	// 	// await this.setStateAsync('testVariable', true);
	//
	// 	// same thing, but the value is flagged "ack"
	// 	// ack should be always set to true if the value is received from or acknowledged from the target system
	// 	// await this.setStateAsync('testVariable', { val: true, ack: true });
	//
	// 	// same thing, but the state is deleted after 30s (getState will return null afterwards)
	// 	// await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });
	//
	// 	// examples for the checkPassword/checkGroup functions
	// 	// let result = await this.checkPasswordAsync('admin', 'iobroker');
	// 	// this.log.info('check user admin pw iobroker: ' + result);
	//
	// 	// result = await this.checkGroupAsync('admin', 'admin');
	// 	// this.log.info('check group user admin group admin: ' + result);
	// }

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			//this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

			this.updateIngoingStateWithValue(id, state.val);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	private updateIngoingStateWithValue(externalId: string, value: any): void {
		const xidtoUpdate = this.getInnerStateXid(externalId);
		if (xidtoUpdate) {
			this.setState(xidtoUpdate, { val: value, ack: true });
			console.debug(`Updating ingoing-value '${xidtoUpdate}' from '${externalId}' with '${value}'`);
		}
	}

	private async updateIngoingValue(externalId: string): Promise<void> {
		const state = await this.getForeignStateAsync(externalId);

		console.debug('state', state);
		this.updateIngoingStateWithValue(externalId, state?.val);
	}

	private getInnerStateXid(externalId: string): string | undefined {
		let xidtoUpdate;
		switch (externalId) {
			case this.config.optionSourcePvGeneration:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.PV_GENERATION;
				break;
			case this.config.optionSourceBatterySoc:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.BAT_SOC;
				break;
			case this.config.optionSourceIsGridBuying:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING;
				break;
			case this.config.optionSourceIsGridLoad:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.GRID_LOAD;
				break;
			case this.config.optionSourceSolarRadiation:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION;
				break;
			case this.config.optionSourceTotalLoad:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD;
				break;
			case this.config.optionSourceBatteryLoad:
				xidtoUpdate = EXTERNAL_STATE_LANDINGZONE.BAT_LOAD;
				break;
		}

		return xidtoUpdate;
	}

}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new SrcSmartRenewablesConsume(options);
} else {
	// otherwise start the instance directly
	(() => new SrcSmartRenewablesConsume())();
}