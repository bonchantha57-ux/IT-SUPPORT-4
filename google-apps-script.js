/**
 * =========================================================================
 * GOOGLE APPS SCRIPT សម្រាប់ទទួលទិន្នន័យពី APP IT SUPPORT
 * សន្លឹកកិច្ចការ (Spreadsheet ID): 1GaU5uouYAb66fQPPjknsM0tEUujeoXolVSD2Fv00ZXU
 * Link: https://docs.google.com/spreadsheets/d/1GaU5uouYAb66fQPPjknsM0tEUujeoXolVSD2Fv00ZXU/edit?usp=sharing
 * =========================================================================
 * 
 * របៀបដំឡើង (Setup Instructions):
 * 1. បើក Google Sheet ខាងលើ
 * 2. ចុច Extensions (ផ្នែកបន្ថែម) -> Apps Script
 * 3. លុបកូដចាស់ចោល ហើយចម្លង (Copy) កូដទាំងអស់ខាងក្រោមទៅបិទភ្ជាប់ (Paste)
 * 4. ចុច Save (រូបថាស diskette)
 * 5. ចុច Deploy -> New deployment
 * 6. ត្រង់ Select type ជ្រើសយក "Web app"
 * 7. បំពេញ Description: "IT Support Form API"
 * 8. ត្រង់ Execute as: ជ្រើសយក "Me" (គណនីរបស់អ្នក)
 * 9. ត្រង់ Who has access: ជ្រើសរើស "Anyone" (សំខាន់បំផុត!)
 * 10. ចុច "Deploy" -> ចុច "Authorize Access" និង Allow
 * 11. ចម្លងយក "Web app URL" (មានទម្រង់ https://script.google.com/macros/s/.../exec)
 * 12. យក Web app URL នោះមកដាក់ក្នុង App ដើម្បីបញ្ជូនទិន្នន័យចូល Sheet ភ្លាមៗ!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // ការពារទិន្នន័យជាន់គ្នាក្នុងពេលតែមួយ
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    // ទទួលទិន្នន័យតាម JSON ឬ Form Parameter
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // ប្រសិនបើសន្លឹកទទេ (Sheet ទើបបង្កើតថ្មី) ត្រូវបង្កើតក្បាលតារាង (Headers)
    if (sheet.getLastRow() === 0) {
      var headers = [
        "កាលបរិច្ឆេទ (Timestamp)",
        "ឈ្មោះ (Full Name)",
        "លេខទូរស័ព្ធ (Phone Number)",
        "Telegram Username",
        "អ៊ីមែល (Email)",
        "ជំនាញស្រឡាញ់ (Skills)",
        "គោលបំណងនៃការចូលមកជា IT Support (Purpose)"
      ];
      sheet.appendRow(headers);
      
      // រចនាក្បាលតារាងឱ្យស្រស់ស្អាត
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1E40AF"); // ពណ៌ខៀវ Royal Blue
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(11);
      headerRange.setHorizontalAlignment("center");
      sheet.setRowHeight(1, 38);
    }

    // ពេលវេលាបច្ចុប្បន្ននៅកម្ពុជា (GMT+7)
    var timestamp = Utilities.formatDate(new Date(), "Asia/Phnom_Penh", "yyyy-MM-dd HH:mm:ss");

    // បញ្ចូលជួរដេកថ្មី
    var rowData = [
      data.timestamp || timestamp,
      data.name || "",
      data.phone || "",
      data.telegram || "",
      data.email || "",
      data.skill || "",
      data.purpose || ""
    ];

    sheet.appendRow(rowData);

    // រៀបទំហំជួរដេក និង align ឱ្យស្រស់ស្អាត
    var lastRow = sheet.getLastRow();
    sheet.setRowHeight(lastRow, 30);
    sheet.getRange(lastRow, 1).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 3).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 4).setHorizontalAlignment("center");

    var result = {
      status: "success",
      message: "បានបញ្ចូលទិន្នន័យជោគជ័យ!",
      row: lastRow,
      data: {
        name: data.name,
        timestamp: timestamp
      }
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// សម្រាប់ធ្វើតេស្តពិនិត្យមើលថាតើ API ដំណើរការឬនៅ
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var totalRows = Math.max(0, sheet.getLastRow() - 1);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      message: "Google Apps Script IT Support Webhook is running smoothly!",
      spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
      totalSubmissions: totalRows,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

