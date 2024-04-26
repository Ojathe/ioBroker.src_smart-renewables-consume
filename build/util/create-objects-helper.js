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
var create_objects_helper_exports = {};
__export(create_objects_helper_exports, {
  createObject: () => createObject,
  createObjectBool: () => createObjectBool,
  createObjectNum: () => createObjectNum,
  createObjectString: () => createObjectString
});
module.exports = __toCommonJS(create_objects_helper_exports);
async function createObject(context, name, typeName, defaultValue, props, accessProps = { read: true, write: true }) {
  await context.setObjectNotExistsAsync(name, {
    type: "state",
    common: {
      name,
      type: typeName,
      role: "indicator",
      desc: props == null ? void 0 : props.desc,
      unit: props == null ? void 0 : props.unit,
      read: accessProps.read,
      write: accessProps.write,
      custom: props == null ? void 0 : props.custom
    },
    native: {}
  });
  context.subscribeStates(name);
  await context.setStateAsync(name, { val: defaultValue, ack: true });
}
async function createObjectString(adapter, name, defaultValue = "", props, accessProps) {
  await createObject(adapter, name, "string", defaultValue, props, accessProps);
}
async function createObjectBool(adapter, name, defaultValue = false, props, accessProps) {
  await createObject(adapter, name, "boolean", defaultValue, props, accessProps);
}
async function createObjectNum(adapter, name, defaultValue = 0, props, accessProps) {
  await createObject(adapter, name, "number", defaultValue, props, accessProps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createObject,
  createObjectBool,
  createObjectNum,
  createObjectString
});
//# sourceMappingURL=create-objects-helper.js.map
