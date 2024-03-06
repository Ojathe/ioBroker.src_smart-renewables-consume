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
var average_value_handler_exports = {};
__export(average_value_handler_exports, {
  AverageValueHandler: () => AverageValueHandler,
  calculateAverageValue: () => calculateAverageValue
});
module.exports = __toCommonJS(average_value_handler_exports);
var import_average_value = require("./average-value");
var import_dp_handler = require("./dp-handler");
var import_state_util = require("./util/state-util");
class AverageValueHandler {
  constructor(adapter) {
    this.adapter = adapter;
  }
  _solar;
  get solar() {
    return this._solar;
  }
  _powerPv;
  get powerPv() {
    return this._powerPv;
  }
  _powerDif;
  get powerDif() {
    return this._powerDif;
  }
  _powerGrid;
  get powerGrid() {
    return this._powerGrid;
  }
  _batLoad;
  get batLoad() {
    return this._batLoad;
  }
  static async build(adapter) {
    const val = new AverageValueHandler(adapter);
    val._solar = await import_average_value.AverageValue.build(adapter, "solar-radiation", {
      desc: "Average solar radiation",
      xidSource: import_dp_handler.XID_INGOING_SOLAR_RADIATION,
      unit: "wm\xB2"
    });
    val._powerPv = await import_average_value.AverageValue.build(adapter, "power-pv", {
      desc: "PV generation",
      xidSource: import_dp_handler.XID_INGOING_PV_GENERATION,
      unit: "kW"
    });
    val._batLoad = await import_average_value.AverageValue.build(adapter, "bat-load", {
      desc: "The Battery load (-) consuming / (+) charging",
      xidSource: import_dp_handler.XID_INGOING_BAT_LOAD,
      unit: "kW"
    });
    val._powerDif = await import_average_value.AverageValue.build(adapter, "power-dif", {
      desc: "difference of energy over generation (+) and loss consumption(-)",
      async mutation(_val) {
        const load = await (0, import_state_util.getStateAsNumber)(adapter, import_dp_handler.XID_INGOING_TOTAL_LOAD);
        const pvPower = await (0, import_state_util.getStateAsNumber)(adapter, import_dp_handler.XID_INGOING_PV_GENERATION);
        if (!load || !pvPower) {
          return Number.NEGATIVE_INFINITY;
        }
        console.debug(
          `Calculating PowerDif Load:${load} kWh, PV-Gen: ${pvPower} kWh => Dif of ${pvPower - load}`
        );
        return round(pvPower - load);
      }
    });
    val._powerGrid = await import_average_value.AverageValue.build(adapter, "power-grid", {
      desc: "amount of generation(+) or buying(-) of energy",
      xidSource: import_dp_handler.XID_INGOING_GRID_LOAD,
      async mutation(val2) {
        var _a;
        const isGridBuying = (_a = await (0, import_state_util.getStateAsBoolean)(adapter, import_dp_handler.XID_INGOING_IS_GRID_BUYING)) != null ? _a : true;
        return round(val2 * (isGridBuying ? -1 : 1));
      }
    });
    return val;
  }
  async calculate() {
    await this.calculateItem(this.powerDif);
    await this.calculateItem(this.powerGrid);
    await this.calculateItem(this.powerPv);
    await this.calculateItem(this.solar);
  }
  async calculateItem(item) {
    var _a;
    let sourceVal = 0;
    if (item.xidSource) {
      sourceVal = (_a = await (0, import_state_util.getStateAsNumber)(this.adapter, item.xidSource)) != null ? _a : 0;
    }
    if (item.mutation) {
      sourceVal = await item.mutation(sourceVal);
    }
    console.debug(`Updating Current Value (${sourceVal}) with xid: ${item.xidCurrent}`);
    await this.adapter.setStateAsync(item.xidCurrent, sourceVal);
    try {
      const end = Date.now();
      const start10Min = end - 60 * 1e3 * 10;
      const start5Min = end - 60 * 1e3 * 5;
      this.adapter.sendTo("history.0", "getHistory", {
        id: `${this.adapter.name}.${this.adapter.instance}.${item.xidCurrent}`,
        options: {
          start: start10Min,
          end,
          aggregate: "none"
        }
      });
      const result = await this.adapter.sendToAsync("history.0", "getHistory", {
        id: `${this.adapter.name}.${this.adapter.instance}.${item.xidCurrent}`,
        options: {
          start: start10Min,
          end,
          aggregate: "none"
        }
      });
      const values = result.result;
      await this.calculateAvgValue(values, item.xidAvg);
      await this.calculateAvgValue(values, item.xidAvg5, start5Min);
    } catch (error) {
      console.error(`calculateAvgValue(${item.getCurrent}) # ${error}`);
    }
  }
  async calculateAvgValue(values, xidTarget, startInMs = 0) {
    values = values.filter((item) => item.val > 0 && item.ts >= startInMs);
    const { sum, count, avg } = calculateAverageValue(values);
    console.debug(`Updating Average Value ( ${avg} ) (sum: ${sum}, count: ${count}) with xid: ` + xidTarget);
    await this.adapter.setStateAsync(xidTarget, { val: avg, ack: true });
  }
}
function calculateAverageValue(values) {
  const sum = round(values.map((item) => item.val).reduce((prev, curr) => prev + curr, 0));
  const count = values.length != 0 ? values.length : 0;
  const avg = round(sum / (count > 0 ? count : 1));
  return { sum, count, avg };
}
function round(val) {
  return Math.round(val * 100) / 100;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AverageValueHandler,
  calculateAverageValue
});
//# sourceMappingURL=average-value-handler.js.map
