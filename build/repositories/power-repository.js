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
var power_repository_exports = {};
__export(power_repository_exports, {
  PowerRepository: () => PowerRepository
});
module.exports = __toCommonJS(power_repository_exports);
var import_average_value = require("../values/average-value");
var import_state_util = require("../util/state-util");
var import_math = require("../util/math");
var import_landing_zone_repository = require("./landing-zone-repository");
class PowerRepository {
  solarRadiation;
  powerBalance;
  powerBattery;
  powerPv;
  powerGrid;
  constructor() {
  }
  get members() {
    if (!this.solarRadiation || !this.powerPv || !this.powerBalance || !this.powerGrid || !this.powerBattery) {
      throw new Error("make sure to build the value group before use its values");
    }
    return {
      solarRadiation: this.solarRadiation,
      powerPv: this.powerPv,
      powerBalance: this.powerBalance,
      powerGrid: this.powerGrid,
      powerBattery: this.powerBattery
    };
  }
  get avg() {
    return {
      solarRadiation: this.members.solarRadiation.avg.getValue,
      powerPv: this.members.powerPv.avg.getValue,
      powerBalance: this.members.powerBalance.avg.getValue,
      powerGrid: this.members.powerGrid.avg.getValue,
      powerBattery: this.members.powerBattery.avg.getValue
    };
  }
  get avg5() {
    return {
      solarRadiation: this.members.solarRadiation.avg5.getValue,
      powerPv: this.members.powerPv.avg5.getValue,
      powerBalance: this.members.powerBalance.avg5.getValue,
      powerGrid: this.members.powerGrid.avg5.getValue,
      powerBattery: this.members.powerBattery.avg5.getValue
    };
  }
  get current() {
    return {
      solarRadiation: this.members.solarRadiation.current.getValue,
      powerPv: this.members.powerPv.current.getValue,
      powerBalance: this.members.powerBalance.current.getValue,
      powerGrid: this.members.powerGrid.current.getValue,
      powerBattery: this.members.powerBattery.current.getValue
    };
  }
  static async create(adapter) {
    const val = new PowerRepository();
    val.solarRadiation = await import_average_value.AverageValue.build(adapter, "solar-radiation", {
      desc: "Average solar radiation",
      xidSource: import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION,
      unit: "wm\xB2"
    });
    val.powerPv = await import_average_value.AverageValue.build(adapter, "power-pv", {
      desc: "PV generation",
      xidSource: import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.PV_GENERATION,
      unit: "kW"
    });
    val.powerBattery = await import_average_value.AverageValue.build(adapter, "bat-load", {
      desc: "The Battery load (-) consuming / (+) charging",
      xidSource: import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.BAT_LOAD,
      unit: "kW"
    });
    val.powerBalance = await import_average_value.AverageValue.build(adapter, "power-dif", {
      desc: "difference of energy over generation (+) and loss consumption(-)",
      async mutation(_val) {
        const load = await (0, import_state_util.getStateAsNumber)(adapter, import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD);
        const pvPower = await (0, import_state_util.getStateAsNumber)(adapter, import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.PV_GENERATION);
        if (!load || !pvPower) {
          return Number.NEGATIVE_INFINITY;
        }
        console.debug(
          `Calculating PowerDif Load:${load} kWh, PV-Gen: ${pvPower} kWh => Dif of ${pvPower - load}`
        );
        return (0, import_math.round)(pvPower - load);
      }
    });
    val.powerGrid = await import_average_value.AverageValue.build(adapter, "power-grid", {
      desc: "amount of generation(+) or buying(-) of energy",
      xidSource: import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.GRID_LOAD,
      async mutation(val2) {
        var _a;
        const isGridBuying = (_a = await (0, import_state_util.getStateAsBoolean)(adapter, import_landing_zone_repository.EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING)) != null ? _a : true;
        return (0, import_math.round)(val2 * (isGridBuying ? -1 : 1));
      }
    });
    return val;
  }
  async calculate() {
    for (const valueKey in this.members) {
      await this.members[valueKey].calculate();
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PowerRepository
});
//# sourceMappingURL=power-repository.js.map
