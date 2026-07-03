/**
 * RUZIVO M&E BACKEND — Google Apps Script Web App
 * ---------------------------------------------------------------
 * SETUP (5 minutes, one time):
 * 1. Go to https://sheets.google.com and create a new blank spreadsheet.
 *    Rename it "RUZIVO M&E Data".
 * 2. In the sheet, click Extensions → Apps Script.
 * 3. Delete any starter code in the editor, paste this entire file in its place.
 * 4. Click Deploy → New deployment.
 *    - Type: "Web app"
 *    - Description: RUZIVO backend
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy. Google will show a Web App URL ending in /exec.
 *    Copy that URL — it is your CONFIG.API_URL in RUZIVO.html.
 * 6. The first time it runs it will auto-create a "Players" tab with headers.
 * ---------------------------------------------------------------
 * This sheet becomes your live, human-readable M&E record: open it any
 * time in Google Sheets to see every player, country and score, or let
 * the RUZIVO dashboard pull from it automatically.
 */

const SHEET_NAME = "Players";
const HEADERS = ["timestamp","name","country","org","role","lang","score","pct","deiProfile","practitionerLevel","zonesCompleted"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const row = HEADERS.map(h => body[h] !== undefined ? body[h] : "");
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action || "list";
    if (action === "list") {
      const sheet = getSheet_();
      const values = sheet.getDataRange().getValues();
      const headers = values.shift() || HEADERS;
      const players = values.map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
      return ContentService.createTextOutput(JSON.stringify({ ok: true, players }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, status: "RUZIVO backend live" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
