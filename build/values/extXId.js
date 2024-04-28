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
var extXId_exports = {};
__export(extXId_exports, {
  ExtXId: () => ExtXId,
  ExtXidBool: () => ExtXidBool,
  ExtXidNumber: () => ExtXidNumber
});
module.exports = __toCommonJS(extXId_exports);
class ExtXId {
  constructor(xid, adapter) {
    this.xid = xid;
    this.adapter = adapter;
    if (adapter === void 0) {
      throw new Error("adapter has to be defined!");
    }
  }
  isManaged = false;
  static async asManagedBase(adapter, extXid, typeName) {
    const instance = await ExtXId.asManagedBase(adapter, extXid, typeName);
    instance.isManaged = true;
    return instance;
  }
  static async asReadableBase(adapter, extXid, typeName) {
    const state = await adapter.getForeignStateAsync(extXid);
    const object = await adapter.getForeignObjectAsync(extXid);
    if (!state || !object) {
      throw new Error(`Non existing foreign State '${extXid}'`);
    }
    if (object.common.type !== typeName) {
      throw new Error(`Mismatching type for foreign state  '${extXid}' (expected: ${typeName}, given: ${object.common.type})`);
    }
    return new ExtXId(extXid, adapter);
  }
  getValue = async () => {
    if (this.adapter === void 0) {
      throw new Error("adapter is not defined");
    }
    const state = await this.adapter.getForeignStateAsync(this.xid);
    if (state === void 0 || state == null) {
      throw new Error("foreign state is not defined:" + this.xid);
    }
    if (state.val === void 0) {
      throw new Error("No value present in foreign state: " + this.xid);
    }
    return state.val;
  };
  async setValue(value) {
    if (!this.isManaged) {
      throw new Error("Non managed xid's are not allowed to write values: " + this.xid);
    }
    return this.adapter.setStateAsync(this.xid, value, true);
  }
}
class ExtXidNumber extends ExtXId {
  static async asReadable(adapter, xid) {
    return ExtXId.asReadableBase(adapter, xid, "number");
  }
  static async asManaged(adapter, xid) {
    return ExtXId.asManagedBase(adapter, xid, "number");
  }
}
class ExtXidBool extends ExtXId {
  static async asReadable(adapter, xid) {
    return ExtXId.asReadableBase(adapter, xid, "boolean");
  }
  static async asManaged(adapter, xid) {
    return ExtXId.asManagedBase(adapter, xid, "boolean");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExtXId,
  ExtXidBool,
  ExtXidNumber
});
//# sourceMappingURL=extXId.js.map
