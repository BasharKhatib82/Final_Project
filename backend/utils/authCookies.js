//backend\utils\authCookies.js

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 1000 * 60 * 60,
  path: "/",
  domain: ".respondify-crm.co.il",
};

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", cookieOptions);
};
