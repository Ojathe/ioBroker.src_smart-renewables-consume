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
var state_util_exports = {};
__export(state_util_exports, {
  getStateAsBoolean: () => getStateAsBoolean,
  getStateAsNumber: () => getStateAsNumber,
  setStateAsBoolean: () => setStateAsBoolean,
  setStateAsNumber: () => setStateAsNumber
});
module.exports = __toCommonJS(state_util_exports);
const getStateAsNumber = async (adapter, xid) => {
  const state = await adapter.getStateAsync(xid);
  if (!state) {
    console.debug(
      `Result is undefined: 'await adapter.getStateAsync(${adapter.name}.${adapter.instance}. + ${xid})'`
    );
    return void 0;
  }
  if (typeof state.val !== "number") {
    console.debug(
      `Result is not a number: 'await adapter.getStateAsync(${adapter.name}.${adapter.instance}. + ${xid})'`
    );
    return void 0;
  }
  return state.val;
};
const getStateAsBoolean = async (adapter, xid) => {
  const state = await adapter.getStateAsync(xid);
  if (!state) {
    return void 0;
  }
  if (typeof state.val == "boolean") {
    return state.val;
  }
  return void 0;
};
const setStateAsBoolean = async (adapter, xid, value) => {
  await adapter.setStateAsync(xid, { val: value, ack: true });
};
const setStateAsNumber = async (adapter, xid, value) => {
  await adapter.setStateAsync(xid, { val: value, ack: true });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getStateAsBoolean,
  getStateAsNumber,
  setStateAsBoolean,
  setStateAsNumber
});
//# sourceMappingURL=state-util.js.map
