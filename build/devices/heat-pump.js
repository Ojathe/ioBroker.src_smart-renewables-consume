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
var heat_pump_exports = {};
__export(heat_pump_exports, {
  HeatPumpImpl: () => HeatPumpImpl
});
module.exports = __toCommonJS(heat_pump_exports);
class HeatPumpImpl {
  constructor(config) {
    this.config = config;
    this.actualTemp = () => this.config.sensors.actualTemp.getValue();
    this.targetTemp = () => this.config.sensors.targetTemp.getValue();
    this.load = () => this.config.measurements.load.getValue();
    this.loadTotal = () => this.config.measurements.loadTotal.getValue();
  }
  actualTemp;
  load;
  loadTotal;
  targetTemp;
  static create = async (config) => {
    const pump = new HeatPumpImpl(config);
    return pump;
  };
  operating = async () => {
    return await this.load() > 15;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HeatPumpImpl
});
//# sourceMappingURL=heat-pump.js.map
