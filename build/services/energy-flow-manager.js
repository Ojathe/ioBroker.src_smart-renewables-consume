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
var energy_flow_manager_exports = {};
__export(energy_flow_manager_exports, {
  EnergyFlowManager: () => EnergyFlowManager
});
module.exports = __toCommonJS(energy_flow_manager_exports);
class EnergyFlowManager {
  constructor(powerRepo, landingZoneRepo, eegRepo, heatingRepository, automatedDevices) {
    this.powerRepo = powerRepo;
    this.landingZoneRepo = landingZoneRepo;
    this.eegRepo = eegRepo;
    this.heatingRepository = heatingRepository;
    this.automatedDevices = automatedDevices;
  }
  run = async () => {
    const loss = await this.eegRepo.loss.getValue();
    const bonus = await this.eegRepo.bonus.getValue();
    const operating = await this.eegRepo.operating.getValue();
    if (!loss && !bonus || !operating) {
      return false;
    }
    return true;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnergyFlowManager
});
//# sourceMappingURL=energy-flow-manager.js.map
