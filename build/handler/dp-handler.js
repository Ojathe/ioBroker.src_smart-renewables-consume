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
var dp_handler_exports = {};
__export(dp_handler_exports, {
  EXTERNAL_STATE_LANDINGZONE: () => EXTERNAL_STATE_LANDINGZONE,
  INTERNAL_STATE_EEG: () => INTERNAL_STATE_EEG,
  addSubscriptions: () => addSubscriptions,
  createObjects: () => createObjects
});
module.exports = __toCommonJS(dp_handler_exports);
var import_create_objects_helper = require("../util/create-objects-helper");
const EXTERNAL_STATE_LANDINGZONE = {
  PV_GENERATION: "ingoing.pv-generation",
  TOTAL_LOAD: "ingoing.total-load",
  BAT_SOC: "ingoing.bat-soc",
  SOLAR_RADIATION: "ingoing.solar-radiation",
  IS_GRID_BUYING: "ingoing.is-grid-buying",
  GRID_LOAD: "ingoing.grid-load",
  BAT_LOAD: "ingoing.bat-load"
};
const INTERNAL_STATE_EEG = {
  BONUS: "eeg-state.bonus",
  LOSS: "eeg-state.loss",
  SOC_LAST_BONUS: "eeg-state.soc-last-bonus",
  OPERATION: "eeg-state.operation"
};
const createObjects = async (adapter) => {
  await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 0, {
    desc: "The amount of power currently generated",
    unit: "kWh"
  });
  await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 0, {
    desc: "The overall amount of currently consumend power",
    unit: "kWh"
  });
  await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_SOC, 0, {
    desc: "The battery stand of charge",
    unit: "%"
  });
  await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 0, {
    desc: "The Solar Radiation",
    unit: "w\\m\xB2"
  });
  await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0, {
    desc: "The grids load",
    unit: "kWh"
  });
  await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD, 0, {
    desc: "The battery load",
    unit: "kWh"
  });
  await (0, import_create_objects_helper.createObjectBool)(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false, {
    desc: "True, if the System is buying energy from grid (external)"
  });
  await (0, import_create_objects_helper.createObjectBool)(adapter, INTERNAL_STATE_EEG.BONUS, false, {
    desc: "True, if there is more Power then used"
  });
  await (0, import_create_objects_helper.createObjectBool)(adapter, INTERNAL_STATE_EEG.LOSS, false, {
    desc: "True, if there is less Power then used"
  });
  await (0, import_create_objects_helper.createObjectBool)(adapter, INTERNAL_STATE_EEG.OPERATION, false, {
    desc: "True, if the system should be managed"
  });
  await (0, import_create_objects_helper.createObjectNum)(adapter, INTERNAL_STATE_EEG.SOC_LAST_BONUS, 0, {
    desc: "Batteries SoC when the last Bonus was detected"
  });
};
const addSubscriptions = (adapter, config) => {
  adapter.subscribeForeignStates(config.optionSourcePvGeneration);
  adapter.subscribeForeignStates(config.optionSourceTotalLoad);
  adapter.subscribeForeignStates(config.optionSourceBatterySoc);
  adapter.subscribeForeignStates(config.optionSourceSolarRadiation);
  adapter.subscribeForeignStates(config.optionSourceIsGridBuying);
  adapter.subscribeForeignStates(config.optionSourceIsGridLoad);
  adapter.subscribeForeignStates(config.optionSourceBatteryLoad);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EXTERNAL_STATE_LANDINGZONE,
  INTERNAL_STATE_EEG,
  addSubscriptions,
  createObjects
});
//# sourceMappingURL=dp-handler.js.map
