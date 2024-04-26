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
var average_value_group_exports = {};
__export(average_value_group_exports, {
  AverageValueGroup: () => AverageValueGroup
});
module.exports = __toCommonJS(average_value_group_exports);
var import_average_value = require("./average-value");
var import_state_util = require("../util/state-util");
var import_dp_handler = require("../handler/dp-handler");
var import_math = require("../util/math");
class AverageValueGroup {
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
    const val = new AverageValueGroup(adapter);
    val._solar = await import_average_value.AverageValue.build(adapter, "solar-radiation", {
      desc: "Average solar radiation",
      xidSource: import_dp_handler.EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION,
      unit: "wm\xB2"
    });
    val._powerPv = await import_average_value.AverageValue.build(adapter, "power-pv", {
      desc: "PV generation",
      xidSource: import_dp_handler.EXTERNAL_STATE_LANDINGZONE.PV_GENERATION,
      unit: "kW"
    });
    val._batLoad = await import_average_value.AverageValue.build(adapter, "bat-load", {
      desc: "The Battery load (-) consuming / (+) charging",
      xidSource: import_dp_handler.EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
      unit: "kW"
    });
    val._powerDif = await import_average_value.AverageValue.build(adapter, "power-dif", {
      desc: "difference of energy over generation (+) and loss consumption(-)",
      async mutation(_val) {
        const load = await (0, import_state_util.getStateAsNumber)(adapter, import_dp_handler.EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD);
        const pvPower = await (0, import_state_util.getStateAsNumber)(adapter, import_dp_handler.EXTERNAL_STATE_LANDINGZONE.PV_GENERATION);
        if (!load || !pvPower) {
          return Number.NEGATIVE_INFINITY;
        }
        console.debug(
          `Calculating PowerDif Load:${load} kWh, PV-Gen: ${pvPower} kWh => Dif of ${pvPower - load}`
        );
        return (0, import_math.round)(pvPower - load);
      }
    });
    val._powerGrid = await import_average_value.AverageValue.build(adapter, "power-grid", {
      desc: "amount of generation(+) or buying(-) of energy",
      xidSource: import_dp_handler.EXTERNAL_STATE_LANDINGZONE.GRID_LOAD,
      async mutation(val2) {
        var _a;
        const isGridBuying = (_a = await (0, import_state_util.getStateAsBoolean)(adapter, import_dp_handler.EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING)) != null ? _a : true;
        return (0, import_math.round)(val2 * (isGridBuying ? -1 : 1));
      }
    });
    return val;
  }
  async calculate() {
    await this.powerDif.calculate();
    await this.powerGrid.calculate();
    await this.powerPv.calculate();
    await this.solar.calculate();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AverageValueGroup
});
//# sourceMappingURL=average-value-group.js.map
