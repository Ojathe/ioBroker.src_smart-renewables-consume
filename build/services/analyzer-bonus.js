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
class AnalyzerBonus {
  constructor(powerRepo, landingZoneRepo, eegRepo) {
    this.powerRepo = powerRepo;
    this.landingZoneRepo = landingZoneRepo;
    this.eegRepo = eegRepo;
  }
  // TODO move to config
  static sellingThreshold = 0.2;
  static bonusReportThreshold = 0.1;
  static batChargeMinimum = 10;
  async run() {
    let powerBonus = false;
    const powerDif = await this.powerRepo.current.powerBalance();
    const powerDifAvg = await this.powerRepo.avg.powerBalance();
    const gridPowerAvg = await this.powerRepo.avg.powerGrid();
    const batSoC = await this.landingZoneRepo.batterySoC.getValue();
    if (gridPowerAvg > AnalyzerBonus.sellingThreshold) {
      powerBonus = true;
    }
    if (powerDifAvg > AnalyzerBonus.bonusReportThreshold) {
      powerBonus = true;
    }
    if (batSoC <= AnalyzerBonus.batChargeMinimum || powerDif < 0) {
      powerBonus = false;
    }
    const msg = `BonusAnalysis # Bonus PowerDif=${powerDif} PowerDifAvg=${powerDifAvg} => powerBonus:${powerBonus} SOC=${batSoC}`;
    const reportedBonus = await this.eegRepo.bonus.getValue();
    if (powerBonus && !reportedBonus) {
      console.log(msg + " || STATE CHANGED");
    } else {
      console.debug(msg);
    }
    if (powerBonus) {
      await this.eegRepo.socLastBonus.setValue(batSoC);
    }
    await this.eegRepo.bonus.setValue(powerBonus);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyzerBonus
});
//# sourceMappingURL=analyzer-bonus.js.map
