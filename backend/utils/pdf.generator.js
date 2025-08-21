import puppeteer from "puppeteer";

export function htmlToPdfBuffer(html) {
  // בלי async/await בצד הצורך: נחזיר Promise
  return puppeteer
    .launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
    .then((browser) =>
      browser.newPage().then((page) =>
        page
          .setContent(html, { waitUntil: "networkidle0" })
          .then(() => page.pdf({ format: "A4", printBackground: true }))
          .finally(() => browser.close())
      )
    );
}
