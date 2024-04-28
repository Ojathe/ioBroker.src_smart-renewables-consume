"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var external_state_connector_exports = {};
__export(external_state_connector_exports, {
  ExternalStateConnector: () => ExternalStateConnector
});
module.exports = __toCommonJS(external_state_connector_exports);
var import_landing_zone_repository = require("../repositories/landing-zone-repository");
class ExternalStateConnector {
  constructor(adapter, config) {
    this.adapter = adapter;
    this.config = config;
  }
  static async create(adapter, config) {
    const connector = new ExternalStateConnector(adapter, config);
    await connector.initialize();
    connector.addSubscriptions();
    return connector;
  }
  onSubscribedStateChanged(externalId, value) {
    const xidtoUpdate = this.getInnerStateXid(externalId);
    if (xidtoUpdate) {
      this.adapter.setState(xidtoUpdate, { val: value, ack: true });
      console.debug(`Updating ingoing-value '${xidtoUpdate}' from '${externalId}' with '${value}'`);
    }
  }
  async initialize() {
    const configToMap = [
      this.config.optionSourcePvGeneration,
      this.config.optionSourceBatterySoc,
      this.config.optionSourceIsGridBuying,
      this.config.optionSourceIsGridLoad,
      this.config.optionSourceSolarRadiation,
      this.config.optionSourceTotalLoad,
      this.config.optionSourceBatteryLoad
    ];
    for (const externalId of configToMap) {
      const state = await this.adapter.getForeignStateAsync(externalId);
      this.onSubscribedStateChanged(externalId, state == null ? void 0 : state.val);
    }
  }
  getInnerStateXid(externalId) {
    let xidtoUpdate;
    switch (externalId) {
      case this.config.optionSourcePvGeneration:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.PV_GENERATION;
        break;
      case this.config.optionSourceBatterySoc:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.BAT_SOC;
        break;
      case this.config.optionSourceIsGridBuying:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING;
        break;
      case this.config.optionSourceIsGridLoad:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.GRID_LOAD;
        break;
      case this.config.optionSourceSolarRadiation:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION;
        break;
      case this.config.optionSourceTotalLoad:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD;
        break;
      case this.config.optionSourceBatteryLoad:
        xidtoUpdate = import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.BAT_LOAD;
        break;
    }
    return xidtoUpdate;
  }
  addSubscriptions() {
    this.adapter.subscribeForeignStates(this.config.optionSourcePvGeneration);
    this.adapter.subscribeForeignStates(this.config.optionSourceTotalLoad);
    this.adapter.subscribeForeignStates(this.config.optionSourceBatterySoc);
    this.adapter.subscribeForeignStates(this.config.optionSourceSolarRadiation);
    this.adapter.subscribeForeignStates(this.config.optionSourceIsGridBuying);
    this.adapter.subscribeForeignStates(this.config.optionSourceIsGridLoad);
    this.adapter.subscribeForeignStates(this.config.optionSourceBatteryLoad);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExternalStateConnector
});
//# sourceMappingURL=external-state-connector.js.map
