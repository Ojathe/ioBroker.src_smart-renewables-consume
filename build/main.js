"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_node_schedule = require("node-schedule");
var import_analyzer_lack = require("./lib/analyzer-lack");
var import_analyzer_bonus = require("./lib/analyzer-bonus");
var import_average_value_handler = require("./lib/average-value-handler");
var import_dp_handler = require("./lib/dp-handler");
var import_state_util = require("./lib/util/state-util");
class SrcSmartRenewablesConsume extends utils.Adapter {
  avgValueHandler;
  analyzerBonus;
  analyzerLack;
  constructor(options = {}) {
    super({
      ...options,
      name: "src_smart-renewables-consume"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
      * Is called when databases are connected and adapter received configuration.
      */
  async onReady() {
    this.log.debug("config " + this.config);
    await (0, import_dp_handler.createObjects)(this);
    (0, import_dp_handler.addSubscriptions)(this, this.config);
    await (0, import_state_util.setStateAsBoolean)(this, import_dp_handler.XID_EEG_STATE_OPERATION, this.config.optionEnergyManagementActive);
    const configToMap = [
      this.config.optionSourcePvGeneration,
      this.config.optionSourceBatterySoc,
      this.config.optionSourceIsGridBuying,
      this.config.optionSourceIsGridLoad,
      this.config.optionSourceSolarRadiation,
      this.config.optionSourceTotalLoad,
      this.config.optionSourceBatteryLoad
    ];
    console.log("configToMap", configToMap);
    for (const externalId of configToMap) {
      console.debug("initializing: " + externalId);
      await this.updateIngoingValue(externalId);
    }
    this.avgValueHandler = await import_average_value_handler.AverageValueHandler.build(this);
    this.analyzerBonus = new import_analyzer_bonus.AnalyzerBonus(this, this.avgValueHandler);
    this.analyzerLack = new import_analyzer_lack.AnalyzerLack(this, this.avgValueHandler);
    (0, import_node_schedule.scheduleJob)("*/20 * * * * *", () => {
      console.debug("calculating average Values");
      this.avgValueHandler.calculate();
    });
    (0, import_node_schedule.scheduleJob)("*/30 * * * * *", () => {
      console.debug("C H E C K I N G   F O R   B O N U S  /  L A C K");
      this.analyzerBonus.run();
      this.analyzerLack.run();
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
  onUnload(callback) {
    try {
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
  onStateChange(id, state) {
    if (state) {
      this.updateIngoingStateWithValue(id, state.val);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  updateIngoingStateWithValue(externalId, value) {
    const xidtoUpdate = this.getInnerStateXid(externalId);
    if (xidtoUpdate) {
      this.setState(xidtoUpdate, { val: value, ack: true });
      console.debug(`Updating ingoing-value '${xidtoUpdate}' from '${externalId}' with '${value}'`);
    }
  }
  async updateIngoingValue(externalId) {
    const state = await this.getForeignStateAsync(externalId);
    console.debug("state", state);
    this.updateIngoingStateWithValue(externalId, state == null ? void 0 : state.val);
  }
  getInnerStateXid(externalId) {
    let xidtoUpdate;
    switch (externalId) {
      case this.config.optionSourcePvGeneration:
        xidtoUpdate = import_dp_handler.XID_INGOING_PV_GENERATION;
        break;
      case this.config.optionSourceBatterySoc:
        xidtoUpdate = import_dp_handler.XID_INGOING_BAT_SOC;
        break;
      case this.config.optionSourceIsGridBuying:
        xidtoUpdate = import_dp_handler.XID_INGOING_IS_GRID_BUYING;
        break;
      case this.config.optionSourceIsGridLoad:
        xidtoUpdate = import_dp_handler.XID_INGOING_GRID_LOAD;
        break;
      case this.config.optionSourceSolarRadiation:
        xidtoUpdate = import_dp_handler.XID_INGOING_SOLAR_RADIATION;
        break;
      case this.config.optionSourceTotalLoad:
        xidtoUpdate = import_dp_handler.XID_INGOING_TOTAL_LOAD;
        break;
      case this.config.optionSourceBatteryLoad:
        xidtoUpdate = import_dp_handler.XID_INGOING_BAT_LOAD;
        break;
    }
    return xidtoUpdate;
  }
}
if (require.main !== module) {
  module.exports = (options) => new SrcSmartRenewablesConsume(options);
} else {
  (() => new SrcSmartRenewablesConsume())();
}
//# sourceMappingURL=main.js.map
