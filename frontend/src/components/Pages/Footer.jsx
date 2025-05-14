import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        &copy; {currentYear} &nbsp;|&nbsp; Developed by Tareq Shaltaf & Bashar Khatib</p>
    </footer>
  );
}

export default Footer;
