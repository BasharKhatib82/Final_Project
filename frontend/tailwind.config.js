// frontend\tailwind.config.js

export const theme = {
  extend: {
    fontFamily: {
      alef: ["Alef", "sans-serif"],
      assistant: ["Assistant", "sans-serif"],
      heebo: ["Heebo", "sans-serif"],
      varela: ["Varela Round", "sans-serif"],
      rubik: ["Rubik", "sans-serif"],
    },
    height: {
      vh100: "100vh",
    },
    minHeight: {
      vh100: "100vh",
    },
  },
};

export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const plugins = [];
