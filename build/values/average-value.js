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
var import_xid = require("./xid");
var import_math = require("../util/math");
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
  constructor(adapter, propertyName, iobrokerObjects, props) {
    this.adapter = adapter;
    this.source = props == null ? void 0 : props.source;
    this.propertyName = propertyName;
    this.desc = props == null ? void 0 : props.desc;
    this.mutation = props == null ? void 0 : props.mutation;
    if (!this.mutation && !this.source) {
      throw new Error(`${propertyName}: Es d\xFCrfen nicht xidSource UND Mutation undefniert sein!`);
    }
    this.current = iobrokerObjects.current;
    this.avg = iobrokerObjects.avg;
    this.avg5 = iobrokerObjects.avg5;
  }
  source;
  propertyName;
  desc;
  mutation;
  current;
  avg;
  avg5;
  static async build(adapter, propertyName, props) {
    var _a;
    const { desc, unit, mutation } = props != null ? props : {};
    const source = (props == null ? void 0 : props.xidSource) ? await import_xid.XidNumber.asReadable(adapter, props == null ? void 0 : props.xidSource) : void 0;
    const xid = `avg.${propertyName}.`;
    const description = (_a = props == null ? void 0 : props.desc) != null ? _a : propertyName;
    const iobrokerObjects = {
      current: await import_xid.XidNumber.asManaged(adapter, xid + "current", 0, {
        desc: description,
        unit: props == null ? void 0 : props.unit,
        custom: customHistory
      }),
      avg: await import_xid.XidNumber.asManaged(adapter, xid + "last-10-min", 0, {
        desc: `${description} der letzten 10 Minuten`,
        unit: props == null ? void 0 : props.unit,
        custom: customInflux
      }),
      avg5: await import_xid.XidNumber.asManaged(adapter, xid + "last-5-min", 0, {
        desc: `${description} der letzten 5 Minuten`,
        unit: props == null ? void 0 : props.unit
      })
    };
    return new AverageValue(adapter, propertyName, iobrokerObjects, { desc, unit, mutation, source });
  }
  async calculate() {
    var _a, _b;
    let sourceVal = 0;
    if (this.source) {
      sourceVal = (_b = await ((_a = this.source) == null ? void 0 : _a.getValue())) != null ? _b : 0;
    }
    if (this.mutation) {
      sourceVal = await this.mutation(sourceVal);
    }
    console.debug(`Updating Current Value (${sourceVal}) with xid: ${this.current.xid}`);
    await this.adapter.setStateAsync(this.current.xid, sourceVal, true);
    try {
      const end = Date.now();
      const start10Min = end - 60 * 1e3 * 10;
      const start5Min = end - 60 * 1e3 * 5;
      this.adapter.sendTo("history.0", "getHistory", {
        id: `${this.adapter.name}.${this.adapter.instance}.${this.current.xid}`,
        options: {
          start: start10Min,
          end,
          aggregate: "none"
        }
      });
      const result = await this.adapter.sendToAsync("history.0", "getHistory", {
        id: `${this.adapter.name}.${this.adapter.instance}.${this.current.xid}`,
        options: {
          start: start10Min,
          end,
          aggregate: "none"
        }
      });
      const values = result.result;
      await this.calculateAvgValue(values, this.avg.xid);
      await this.calculateAvgValue(values, this.avg5.xid, start5Min);
    } catch (error) {
      console.error(`calculateAvgValue(${await this.current.getValue()}) # ${error}`);
    }
  }
  async calculateAvgValue(values, xidTarget, startInMs = 0) {
    values = values.filter((item) => item.ts >= startInMs);
    const { sum, count, avg } = (0, import_math.calculateAverageValue)(values);
    console.debug(`Updating Average Value ( ${avg} ) (sum: ${sum}, count: ${count}) with xid: ` + xidTarget);
    await this.adapter.setStateAsync(xidTarget, { val: avg, ack: true });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AverageValue
});
//# sourceMappingURL=average-value.js.map
