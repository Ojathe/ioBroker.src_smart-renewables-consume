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
var analyzer_bonus_exports = {};
__export(analyzer_bonus_exports, {
  AnalyzerBonus: () => AnalyzerBonus
});
module.exports = __toCommonJS(analyzer_bonus_exports);
var import_dp_handler = require("../handler/dp-handler");
var import_state_util = require("../util/state-util");
class AnalyzerBonus {
  constructor(adapter, avgValueHandler) {
    this.adapter = adapter;
    this.avgValueHandler = avgValueHandler;
  }
  // TODO move to config
  static sellingThreshold = 0.2;
  static bonusReportThreshold = 0.1;
  static batChargeMinimum = 10;
  async run() {
    var _a, _b;
    let powerBonus = false;
    const powerDif = await this.avgValueHandler.powerDif.current.getValue();
    const powerDifAvg = await this.avgValueHandler.powerDif.avg.getValue();
    const gridPowerAvg = await this.avgValueHandler.powerGrid.avg.getValue();
    const batSoc = (_a = await (0, import_state_util.getStateAsNumber)(this.adapter, import_dp_handler.EXTERNAL_STATE_LANDINGZONE.BAT_SOC)) != null ? _a : 0;
    if (gridPowerAvg > AnalyzerBonus.sellingThreshold) {
      powerBonus = true;
    }
    if (powerDifAvg > AnalyzerBonus.bonusReportThreshold) {
      powerBonus = true;
    }
    if (batSoc <= AnalyzerBonus.batChargeMinimum || powerDif < 0) {
      powerBonus = false;
    }
    const msg = `BonusAnalysis # Bonus PowerDif=${powerDif} PowerDifAvg=${powerDifAvg} => powerBonus:${powerBonus} SOC=${batSoc}`;
    const reportedBonus = (_b = await (0, import_state_util.getStateAsBoolean)(this.adapter, import_dp_handler.INTERNAL_STATE_EEG.BONUS)) != null ? _b : false;
    if (powerBonus && !reportedBonus) {
      console.log(msg + " || STATE CHANGED");
    } else {
      console.debug(msg);
    }
    if (powerBonus) {
      await this.adapter.setStateAsync(import_dp_handler.INTERNAL_STATE_EEG.SOC_LAST_BONUS, batSoc, true);
    }
    await this.adapter.setStateAsync(import_dp_handler.INTERNAL_STATE_EEG.BONUS, powerBonus, true);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyzerBonus
});
//# sourceMappingURL=analyzer-bonus.js.map
