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
var average_value_exports = {};
__export(average_value_exports, {
  AverageValue: () => AverageValue
});
module.exports = __toCommonJS(average_value_exports);
var import_dp_handler = require("./dp-handler");
var import_state_util = require("./util/state-util");
const customInflux = {
  "influxdb.0": {
    enabled: true,
    storageType: "",
    aliasId: "",
    debounceTime: 0,
    blockTime: 0,
    changesOnly: true,
    changesRelogInterval: 600,
    changesMinDelta: 0.1,
    ignoreBelowNumber: "",
    disableSkippedValueLogging: false,
    enableDebugLogs: false,
    debounce: "1000"
  }
};
const customHistory = {
  "history.0": {
    enabled: true,
    aliasId: "",
    debounceTime: 0,
    blockTime: 0,
    changesOnly: true,
    changesRelogInterval: 600,
    changesMinDelta: 0.1,
    ignoreBelowNumber: "",
    disableSkippedValueLogging: false,
    retention: 604800,
    customRetentionDuration: 365,
    maxLength: 960,
    enableDebugLogs: false,
    debounce: 1e3
  }
};
class AverageValue {
  constructor(adapter, name, props) {
    this.adapter = adapter;
    this.xidSource = props == null ? void 0 : props.xidSource;
    this.name = name;
    this.desc = props == null ? void 0 : props.desc;
    this.mutation = props == null ? void 0 : props.mutation;
    if (!this.mutation && !this.xidSource) {
      throw new Error(`${name}: Es d\xFCrfen nicht xidSource UND Mutation undefniert sein!`);
    }
  }
  xidSource;
  name;
  desc;
  _xidCurrent = "";
  get xidCurrent() {
    return this._xidCurrent;
  }
  _xidAvg = "";
  get xidAvg() {
    return this._xidAvg;
  }
  _xidAvg5 = "";
  get xidAvg5() {
    return this._xidAvg5;
  }
  mutation;
  static async build(adapter, name, props) {
    const val = new AverageValue(adapter, name, props);
    val._xidCurrent = val.createStates(adapter, "current", { unit: props == null ? void 0 : props.unit, custom: customHistory });
    val._xidAvg = val.createStates(adapter, "last-10-min", {
      descAddon: " der letzten 10 Minuten",
      unit: props == null ? void 0 : props.unit,
      custom: customInflux
    });
    val._xidAvg5 = val.createStates(adapter, "last-5-min", {
      descAddon: " der letzten 5 Minuten",
      unit: props == null ? void 0 : props.unit
    });
    return val;
  }
  createStates(context, subItem, props) {
    var _a, _b;
    const xid = `avg.${this.name}.${subItem}`;
    (0, import_dp_handler.createObjectNum)(context, xid, 0, {
      desc: `${(_a = this.desc) != null ? _a : this.name} ${props == null ? void 0 : props.descAddon}`,
      unit: (_b = props == null ? void 0 : props.unit) != null ? _b : "kW",
      custom: props == null ? void 0 : props.custom
    });
    return xid;
  }
  async getCurrent() {
    return await this.getValue(this.xidCurrent);
  }
  async get5Min() {
    return await this.getValue(this.xidAvg5);
  }
  async get10Min() {
    return await this.getValue(this.xidAvg);
  }
  async getValue(xid) {
    const value = await (0, import_state_util.getStateAsNumber)(this.adapter, xid);
    if (!value) {
      console.error(`Could not retrieve value for ${xid}`);
      return 0;
    }
    if (typeof value !== "number") {
      console.error(`Value '${value}' for ${xid} is not a number!`);
      return 0;
    }
    return value;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AverageValue
});
//# sourceMappingURL=average-value.js.map
