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
var xid_exports = {};
__export(xid_exports, {
  XId: () => XId,
  XidBool: () => XidBool,
  XidNumber: () => XidNumber,
  XidString: () => XidString
});
module.exports = __toCommonJS(xid_exports);
var import_create_objects_helper = require("../util/create-objects-helper");
class XId {
  constructor(xid, adapter, isManaged = false) {
    this.xid = xid;
    this.adapter = adapter;
    this.isManaged = isManaged;
  }
  static async asManagedBase(adapter, xid, typeName, defaultValue, props = {}) {
    const object = await adapter.getObjectAsync(xid);
    if (!object) {
      const { desc, unit, custom } = props;
      await (0, import_create_objects_helper.createObject)(adapter, xid, typeName, defaultValue, {
        desc,
        unit,
        custom
      }, props == null ? void 0 : props.access);
    }
    const state = await adapter.getStateAsync(xid);
    if (!state) {
      throw new Error(`Non existing State '${xid}'`);
    }
    return new XId(xid, adapter, true);
  }
  static async asReadableBase(adapter, xid, typeName) {
    const state = await adapter.getStateAsync(xid);
    const object = await adapter.getObjectAsync(xid);
    if (!state || !object) {
      throw new Error(`Non existing State '${xid}'`);
    }
    if (object.common.type !== typeName) {
      throw new Error(`Mismatching type for state  '${xid}' (expected: ${typeName}, given: ${object.common.type})`);
    }
    return new XId(xid, adapter);
  }
  async getValue() {
    var _a;
    const val = (_a = await this.adapter.getStateAsync(this.xid)) == null ? void 0 : _a.val;
    if (val === void 0) {
      throw new Error("No value present in state: " + this.xid);
    }
    return val;
  }
  async setValue(value) {
    if (!this.isManaged) {
      throw new Error("Non managed xid's are not allowed to write values: " + this.xid);
    }
    return this.adapter.setStateAsync(this.xid, value, true);
  }
}
class XidString extends XId {
  static async asReadable(adapter, xid) {
    return XId.asReadableBase(adapter, xid, "string");
  }
}
class XidBool extends XId {
  static async asReadable(adapter, xid) {
    return XId.asReadableBase(adapter, xid, "boolean");
  }
}
class XidNumber extends XId {
  static async asReadable(adapter, xid) {
    return XId.asReadableBase(adapter, xid, "number");
  }
  static async asManaged(adapter, xid, defaultValue = 0, props) {
    return XId.asManagedBase(adapter, xid, "number", defaultValue, props);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  XId,
  XidBool,
  XidNumber,
  XidString
});
//# sourceMappingURL=xid.js.map
