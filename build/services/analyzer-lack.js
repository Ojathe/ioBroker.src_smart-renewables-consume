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
var import_dp_handler = require("../handler/dp-handler");
class AnalyzerLack {
  constructor(adapter, avgValueHandler) {
    this.adapter = adapter;
    this.avgValueHandler = avgValueHandler;
  }
  // TODO move to config
  static lackReportingThreshold = -0.5;
  static gridBuyingThreshold = -0.2;
  async run() {
    var _a, _b, _c, _d;
    let powerLack = false;
    const powerDifAvg5 = await this.avgValueHandler.powerDif.avg5.getValue();
    const gridPowerAvg5 = await this.avgValueHandler.powerGrid.avg5.getValue();
    const batSoc = (_b = (_a = await this.adapter.getStateAsync(import_dp_handler.EXTERNAL_STATE_LANDINGZONE.BAT_SOC)) == null ? void 0 : _a.val) != null ? _b : 0;
    if (powerDifAvg5 < -1.9 && batSoc < 95) {
      powerLack = true;
    }
    if (powerDifAvg5 < -0.9 && batSoc < 60) {
      powerLack = true;
    }
    if (powerDifAvg5 < -0.5 && batSoc < 30) {
      powerLack = true;
    }
    if (powerDifAvg5 < 0 && batSoc < 10) {
      powerLack = true;
    }
    if (gridPowerAvg5 <= AnalyzerLack.gridBuyingThreshold) {
      powerLack = true;
    }
    const msg = `LackAnalysis # Lack GridPowerAvg5=${gridPowerAvg5} => PowerLack:${powerLack} SOC=${batSoc}`;
    const reportedLack = (_d = (_c = await this.adapter.getStateAsync(import_dp_handler.INTERNAL_STATE_EEG.LOSS)) == null ? void 0 : _c.val) != null ? _d : false;
    if (powerLack && !reportedLack) {
      console.log(msg + " || STATE CHANGED");
    } else {
      console.debug(msg);
    }
    await this.adapter.setStateAsync(import_dp_handler.INTERNAL_STATE_EEG.LOSS, powerLack, true);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyzerLack
});
//# sourceMappingURL=analyzer-lack.js.map
