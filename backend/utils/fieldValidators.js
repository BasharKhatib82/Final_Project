// backend\utils\fieldValidators.js

export const isNineDigitId = (v) => /^\d{9}$/.test(String(v));
export const isILPhone10 = (v) => /^05\d{8}$/.test(String(v));
export const isPositiveInt = (v) => /^\d+$/.test(String(v)) && Number(v) > 0;
