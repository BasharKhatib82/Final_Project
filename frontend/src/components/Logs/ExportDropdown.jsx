import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "components/ui/dropdown-menu";
import { Button } from "components/ui/button";
import { FileText, FileSpreadsheet, Printer, Mail } from "lucide-react";
import axios from "axios";

const api = process.env.REACT_APP_API_URL;

const ExportDropdown = () => {
  const handleExport = (type) => {
    const url = `${api}/logs/export/${type}`;
    window.open(url, "_blank");
  };

  const handleSendEmail = async () => {
    const email = prompt("הזן כתובת מייל לשליחה");
    if (!email) return;

    try {
      await axios.post(`${api}/logs/send-email`, {
        to: email,
        subject: "יומן מערכת",
        body: "מצורף קובץ Excel עם תיעוד הפעולות",
      });
      alert("הקובץ נשלח בהצלחה!");
    } catch (err) {
      alert("שגיאה בשליחת המייל");
      console.error(err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-xl shadow-md">אפשרויות ייצוא</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          {" "}
          <FileSpreadsheet className="mr-2" /> ייצוא ל-Excel{" "}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          {" "}
          <FileText className="mr-2" /> ייצוא ל-PDF{" "}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()}>
          {" "}
          <Printer className="mr-2" /> הדפס{" "}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSendEmail}>
          {" "}
          <Mail className="mr-2" /> שלח במייל{" "}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
