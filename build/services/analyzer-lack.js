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
var analyzer_lack_exports = {};
__export(analyzer_lack_exports, {
  AnalyzerLack: () => AnalyzerLack
});
module.exports = __toCommonJS(analyzer_lack_exports);
class AnalyzerLack {
  constructor(powerRepo, landingZoneRepo, eegRepo) {
    this.powerRepo = powerRepo;
    this.landingZoneRepo = landingZoneRepo;
    this.eegRepo = eegRepo;
  }
  // TODO move to config
  static lackReportingThreshold = -0.5;
  static gridBuyingThreshold = -0.2;
  async run() {
    let powerLack = false;
    const powerDifAvg5 = await this.powerRepo.avg5.powerBalance();
    const gridPowerAvg5 = await this.powerRepo.avg5.powerGrid();
    const batSoC = await this.landingZoneRepo.batterySoC.getValue();
    if (powerDifAvg5 < -1.9 && batSoC < 95) {
      powerLack = true;
    }
    if (powerDifAvg5 < -0.9 && batSoC < 60) {
      powerLack = true;
    }
    if (powerDifAvg5 < -0.5 && batSoC < 30) {
      powerLack = true;
    }
    if (powerDifAvg5 < 0 && batSoC < 10) {
      powerLack = true;
    }
    if (gridPowerAvg5 <= AnalyzerLack.gridBuyingThreshold) {
      powerLack = true;
    }
    const msg = `LackAnalysis # Lack GridPowerAvg5=${gridPowerAvg5} => PowerLack:${powerLack} SOC=${batSoC}`;
    const reportedLack = await this.eegRepo.loss.getValue();
    if (powerLack && !reportedLack) {
      console.log(msg + " || STATE CHANGED");
    } else {
      console.debug(msg);
    }
    await this.eegRepo.loss.setValue(powerLack);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyzerLack
});
//# sourceMappingURL=analyzer-lack.js.map
