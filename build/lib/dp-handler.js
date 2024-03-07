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
  XID_EEG_STATE_BONUS: () => XID_EEG_STATE_BONUS,
  XID_EEG_STATE_LOSS: () => XID_EEG_STATE_LOSS,
  XID_EEG_STATE_OPERATION: () => XID_EEG_STATE_OPERATION,
  XID_EEG_STATE_SOC_LAST_BONUS: () => XID_EEG_STATE_SOC_LAST_BONUS,
  XID_INGOING_BAT_LOAD: () => XID_INGOING_BAT_LOAD,
  XID_INGOING_BAT_SOC: () => XID_INGOING_BAT_SOC,
  XID_INGOING_GRID_LOAD: () => XID_INGOING_GRID_LOAD,
  XID_INGOING_IS_GRID_BUYING: () => XID_INGOING_IS_GRID_BUYING,
  XID_INGOING_PV_GENERATION: () => XID_INGOING_PV_GENERATION,
  XID_INGOING_SOLAR_RADIATION: () => XID_INGOING_SOLAR_RADIATION,
  XID_INGOING_TOTAL_LOAD: () => XID_INGOING_TOTAL_LOAD,
  addSubscriptions: () => addSubscriptions,
  createObjectBool: () => createObjectBool,
  createObjectNum: () => createObjectNum,
  createObjectString: () => createObjectString,
  createObjects: () => createObjects
});
module.exports = __toCommonJS(dp_handler_exports);
const XID_INGOING_PV_GENERATION = "ingoing.pv-generation";
const XID_INGOING_TOTAL_LOAD = "ingoing.total-load";
const XID_INGOING_BAT_SOC = "ingoing.bat-soc";
const XID_INGOING_SOLAR_RADIATION = "ingoing.solar-radiation";
const XID_INGOING_IS_GRID_BUYING = "ingoing.is-grid-buying";
const XID_INGOING_GRID_LOAD = "ingoing.grid-load";
const XID_INGOING_BAT_LOAD = "ingoing.bat-load";
const XID_EEG_STATE_BONUS = "eeg-state.bonus";
const XID_EEG_STATE_LOSS = "eeg-state.loss";
const XID_EEG_STATE_SOC_LAST_BONUS = "eeg-state.soc-last-bonus";
const XID_EEG_STATE_OPERATION = "eeg-state.operation";
async function createObject(context, name, typeName, defaultValue, props, accessProps = { read: true, write: true }) {
  await context.setObjectNotExistsAsync(name, {
    type: "state",
    common: {
      name,
      type: typeName,
      role: "indicator",
      desc: props == null ? void 0 : props.desc,
      unit: props == null ? void 0 : props.unit,
      read: accessProps.read,
      write: accessProps.write,
      custom: props == null ? void 0 : props.custom
    },
    native: {}
  });
  context.subscribeStates(name);
  await context.setStateAsync(name, { val: defaultValue, ack: true });
}
async function createObjectString(adapter, name, defaultValue = "", props, accessProps) {
  await createObject(adapter, name, "string", defaultValue, props, accessProps);
}
async function createObjectBool(adapter, name, defaultValue = false, props, accessProps) {
  await createObject(adapter, name, "boolean", defaultValue, props, accessProps);
}
async function createObjectNum(adapter, name, defaultValue = 0, props, accessProps) {
  await createObject(adapter, name, "number", defaultValue, props, accessProps);
}
const createObjects = async (adapter) => {
  await createObjectNum(adapter, XID_INGOING_PV_GENERATION, 0, {
    desc: "The amount of power currently generated",
    unit: "kWh"
  });
  await createObjectNum(adapter, XID_INGOING_TOTAL_LOAD, 0, {
    desc: "The overall amount of currently consumend power",
    unit: "kWh"
  });
  await createObjectNum(adapter, XID_INGOING_BAT_SOC, 0, {
    desc: "The battery stand of charge",
    unit: "%"
  });
  await createObjectNum(adapter, XID_INGOING_SOLAR_RADIATION, 0, {
    desc: "The Solar Radiation",
    unit: "w\\m\xB2"
  });
  await createObjectNum(adapter, XID_INGOING_GRID_LOAD, 0, {
    desc: "The grids load",
    unit: "kWh"
  });
  await createObjectNum(adapter, XID_INGOING_BAT_LOAD, 0, {
    desc: "The battery load",
    unit: "kWh"
  });
  await createObjectBool(adapter, XID_INGOING_IS_GRID_BUYING, false, {
    desc: "True, if the System is buying energy from grid (external)"
  });
  await createObjectBool(adapter, XID_EEG_STATE_BONUS, false, {
    desc: "True, if there is more Power then used"
  });
  await createObjectBool(adapter, XID_EEG_STATE_LOSS, false, {
    desc: "True, if there is less Power then used"
  });
  await createObjectBool(adapter, XID_EEG_STATE_OPERATION, false, {
    desc: "True, if the system should be managed"
  });
  await createObjectNum(adapter, XID_EEG_STATE_SOC_LAST_BONUS, 0, {
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
  XID_EEG_STATE_BONUS,
  XID_EEG_STATE_LOSS,
  XID_EEG_STATE_OPERATION,
  XID_EEG_STATE_SOC_LAST_BONUS,
  XID_INGOING_BAT_LOAD,
  XID_INGOING_BAT_SOC,
  XID_INGOING_GRID_LOAD,
  XID_INGOING_IS_GRID_BUYING,
  XID_INGOING_PV_GENERATION,
  XID_INGOING_SOLAR_RADIATION,
  XID_INGOING_TOTAL_LOAD,
  addSubscriptions,
  createObjectBool,
  createObjectNum,
  createObjectString,
  createObjects
});
//# sourceMappingURL=dp-handler.js.map
