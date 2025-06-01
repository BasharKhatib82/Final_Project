import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/95 text-gray-600 text-center py-4 shadow-2xl mt-auto">
      <p className="text-sm">
        &copy; {currentYear} &nbsp;|&nbsp; Developed by Tareq Shaltaf & Bashar
        Khatib
      </p>
    </footer>
  );
}

export default Footer;
