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
var heating_repository_exports = {};
__export(heating_repository_exports, {
  HeatingRepository: () => HeatingRepository
});
module.exports = __toCommonJS(heating_repository_exports);
var import_heat_pump = require("../devices/heat-pump");
class HeatingRepository {
  constructor() {
  }
  _buffer;
  get buffer() {
    return this._buffer;
  }
  _solarThermal;
  get solarThermal() {
    return this._solarThermal;
  }
  _ventilationUnit;
  get ventilationUnit() {
    return this._ventilationUnit;
  }
  _heatPump;
  get heatPump() {
    return this._heatPump;
  }
  static async create(adapter, config) {
    const repo = new HeatingRepository();
    if (config.heatPumpConfig) {
      repo._heatPump = await import_heat_pump.HeatPumpImpl.create(config.heatPumpConfig);
    }
    return repo;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HeatingRepository
});
//# sourceMappingURL=heating-repository.js.map
