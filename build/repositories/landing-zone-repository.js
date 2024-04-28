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
var landing_zone_repository_exports = {};
__export(landing_zone_repository_exports, {
  EXTERNAL_STATE_LANDINGZONE: () => EXTERNAL_STATE_LANDINGZONE,
  LandingZoneRepoImpl: () => LandingZoneRepoImpl
});
module.exports = __toCommonJS(landing_zone_repository_exports);
var import_xid = require("../values/xid");
var import_create_objects_helper = require("../util/create-objects-helper");
const EXTERNAL_STATE_LANDINGZONE = {
  PV_GENERATION: "ingoing.pv-generation",
  TOTAL_LOAD: "ingoing.total-load",
  BAT_SOC: "ingoing.bat-soc",
  SOLAR_RADIATION: "ingoing.solar-radiation",
  IS_GRID_BUYING: "ingoing.is-grid-buying",
  GRID_LOAD: "ingoing.grid-load",
  BAT_LOAD: "ingoing.bat-load"
};
class LandingZoneRepoImpl {
  constructor() {
  }
  _gridLoad;
  get gridLoad() {
    return this._gridLoad;
  }
  _batLoad;
  get batLoad() {
    return this._batLoad;
  }
  _batterySoC;
  get batterySoC() {
    return this._batterySoC;
  }
  _solarRadiation;
  get solarRadiation() {
    return this._solarRadiation;
  }
  _isGridBuying;
  get isGridBuying() {
    return this._isGridBuying;
  }
  _totalLoad;
  get totalLoad() {
    return this._totalLoad;
  }
  _pvGeneration;
  get pvGeneration() {
    return this._pvGeneration;
  }
  static async create(adapter) {
    const repo = new LandingZoneRepoImpl();
    await repo.createObjects(adapter);
    repo._pvGeneration = await import_xid.XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION);
    repo._totalLoad = await import_xid.XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD);
    repo._gridLoad = await import_xid.XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD);
    repo._batLoad = await import_xid.XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD);
    repo._batterySoC = await import_xid.XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_SOC);
    repo._solarRadiation = await import_xid.XidNumber.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION);
    repo._isGridBuying = await import_xid.XidBool.asReadable(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING);
    return repo;
  }
  createObjects = async (adapter) => {
    await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.PV_GENERATION, 0, {
      desc: "The amount of power currently generated",
      unit: "kWh"
    });
    await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.TOTAL_LOAD, 0, {
      desc: "The overall amount of currently consumend power",
      unit: "kWh"
    });
    await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_SOC, 0, {
      desc: "The battery stand of charge",
      unit: "%"
    });
    await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.SOLAR_RADIATION, 0, {
      desc: "The Solar Radiation",
      unit: "w\\m\xB2"
    });
    await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.GRID_LOAD, 0, {
      desc: "The grids load",
      unit: "kWh"
    });
    await (0, import_create_objects_helper.createObjectNum)(adapter, EXTERNAL_STATE_LANDINGZONE.BAT_LOAD, 0, {
      desc: "The battery load",
      unit: "kWh"
    });
    await (0, import_create_objects_helper.createObjectBool)(adapter, EXTERNAL_STATE_LANDINGZONE.IS_GRID_BUYING, false, {
      desc: "True, if the System is buying energy from grid (external)"
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EXTERNAL_STATE_LANDINGZONE,
  LandingZoneRepoImpl
});
//# sourceMappingURL=landing-zone-repository.js.map
