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
var math_exports = {};
__export(math_exports, {
  calculateAverageValue: () => calculateAverageValue,
  round: () => round
});
module.exports = __toCommonJS(math_exports);
function calculateAverageValue(values) {
  const sum = round(values.map((item) => item.val).reduce((prev, curr) => prev + curr, 0));
  const count = values.length != 0 ? values.length : 0;
  const avg = round(sum / (count > 0 ? count : 1));
  return { sum, count, avg };
}
function round(val) {
  return Math.round(val * 100) / 100;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculateAverageValue,
  round
});
//# sourceMappingURL=math.js.map
