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
var eeg_repository_exports = {};
__export(eeg_repository_exports, {
  EegRepositoryImpl: () => EegRepositoryImpl,
  INTERNAL_STATE_EEG: () => INTERNAL_STATE_EEG
});
module.exports = __toCommonJS(eeg_repository_exports);
var import_xid = require("../values/xid");
const INTERNAL_STATE_EEG = {
  BONUS: "eeg-state.bonus",
  LOSS: "eeg-state.loss",
  SOC_LAST_BONUS: "eeg-state.soc-last-bonus",
  OPERATION: "eeg-state.operation"
};
class EegRepositoryImpl {
  constructor() {
  }
  _bonus;
  get bonus() {
    return this._bonus;
  }
  _loss;
  get loss() {
    return this._loss;
  }
  _operating;
  get operating() {
    return this._operating;
  }
  _socLastBonus;
  get socLastBonus() {
    return this._socLastBonus;
  }
  static async create(adapter) {
    const repo = new EegRepositoryImpl();
    repo._bonus = await import_xid.XidBool.asManaged(adapter, INTERNAL_STATE_EEG.BONUS, false, { desc: "True, if there is more Power then used" });
    repo._loss = await import_xid.XidBool.asManaged(adapter, INTERNAL_STATE_EEG.LOSS, false, { desc: "True, if there is less Power then used" });
    repo._operating = await import_xid.XidBool.asManaged(adapter, INTERNAL_STATE_EEG.OPERATION, false, { desc: "True, if the system should be managed" });
    repo._socLastBonus = await import_xid.XidNumber.asManaged(adapter, INTERNAL_STATE_EEG.SOC_LAST_BONUS, 0, {
      desc: "Batteries SoC when the last Bonus was detected",
      unit: "%"
    });
    return repo;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EegRepositoryImpl,
  INTERNAL_STATE_EEG
});
//# sourceMappingURL=eeg-repository.js.map
