// =================================================================
// HỆ THỐNG ĐẶT HÀNG & QUẢN LÝ ĐƠN AUTOMATION - SẢN PHẨM SONIC & TMV
// Bot Token: 8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY
// Admin Chat IDs: 7744946591, 7607846055
// Spreadsheet ID: 15GrO9Y9hyLQ4PhjggVAqMkmZ_W-9MsDtr0r3SnvLxeo
// =================================================================

var SONIC_TELEGRAM_TOKEN = "8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY";
var SONIC_ADMIN_CHAT_IDS = ["7744946591", "7607846055"];
var SONIC_SPREADSHEET_ID = "15GrO9Y9hyLQ4PhjggVAqMkmZ_W-9MsDtr0r3SnvLxeo"; 
var SONIC_OLD_SPREADSHEET_ID = "15mW6V31uoKEo0NNBWXQEdYuuaSay04clNz4DLUz36UM";

var SONIC_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZg6wWKe_yuV9UgZv2dBquCLNPYPyTqxi0urqcquf9lYdUTNqE0DAN9N8y9g3fXJEj/exec";
var SONIC_SHEET_URL = "https://docs.google.com/spreadsheets/d/" + SONIC_SPREADSHEET_ID + "/edit";
var SONIC_OLD_SHEET_URL = "https://docs.google.com/spreadsheets/d/" + SONIC_OLD_SPREADSHEET_ID + "/edit";
var SONIC_ORDER_WEB_URL = "https://www.tungmuvang.in/p/at-hang.html";

var sonicScriptProps = PropertiesService.getScriptProperties();

// Hàm lấy Sheet an toàn tuyệt đối cho Sonic
function getSonicSheet() {
  try {
    if (SONIC_SPREADSHEET_ID && SONIC_SPREADSHEET_ID.trim() !== "") {
      var ss = SpreadsheetApp.openById(SONIC_SPREADSHEET_ID.trim());
      if (ss) return ss.getSheets()[0];
    }
  } catch (e) {
    Logger.log("Lỗi openById Sonic Sheet: " + e.toString());
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss.getSheets()[0];
  } catch (e) {}
  return null;
}

// Hàm cài Webhook cho Telegram Bot Sonic
function setupSonicTelegramWebhook() {
  var url = "https://api.telegram.org/bot" + SONIC_TELEGRAM_TOKEN + "/setWebhook?url=" + SONIC_WEB_APP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log("Kết quả cài Webhook Telegram Sonic: " + response.getContentText());
}

// Hàm cài đặt trọn gói Webhook Telegram & Trigger tự động quét mail/hủy đơn ngầm mỗi 1 phút
function setupSonicTriggersAndWebhook() {
  setupSonicTelegramWebhook();

  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var fnName = triggers[i].getHandlerFunction();
    if (fnName === "checkSonicBankDepositEmails" || fnName === "checkBankDepositEmails") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("checkSonicBankDepositEmails")
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log("✅ THÀNH CÔNG: Đã cài đặt Webhook Telegram & Trigger chạy ngầm 1 phút/lần!");
}

// =================================================================
// 1. HÀM GET SONIC (WEBSITE CHECK TRẠNG THÁI THANH TOÁN TỰ ĐỘNG & WEB APP)
// =================================================================
function doGetSonic(e) {
  var params = e ? e.parameter : {};
  var callback = params.callback;
  var result = {};

  if (params && params.action === "check_payment_status") {
    var code = params.code;
    if (code) {
      var cleanCode = cleanSonicCodeForMatching(code);
      
      // Quét Gmail TỐC ĐỘ CAO (Quét mỗi 6 giây/lần)
      checkSonicBankDepositEmailsThrottled();

      // Kiểm tra bộ nhớ Cloud PropertiesService hoặc Google Sheet
      var isPaid = sonicScriptProps.getProperty("PAID_STATUS_" + cleanCode);
      if (isPaid === "true" || checkSonicSheetPaidStatus(cleanCode)) {
        sonicScriptProps.setProperty("PAID_STATUS_" + cleanCode, "true");
        result = { status: "paid" };
      } else {
        result = { status: "pending" };
      }
    } else {
      result = { status: "error", message: "Missing code parameter" };
    }
    
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")")
                           .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Hệ Thống Lên Đơn Hàng - TMV & SONIC')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch(errHtml) {
    return ContentService.createTextOutput("Hệ Thống Lên Đơn Hàng SONIC & TMV Active").setMimeType(ContentService.MimeType.TEXT);
  }
}

function checkSonicBankDepositEmailsThrottled() {
  try {
    var lastCheck = parseInt(sonicScriptProps.getProperty("LAST_GMAIL_CHECK_TIME") || "0", 10);
    var now = new Date().getTime();
    if (now - lastCheck < 6000) { 
      return; 
    }
    sonicScriptProps.setProperty("LAST_GMAIL_CHECK_TIME", now.toString());
    checkSonicBankDepositEmails();
  } catch(e) {}
}

// =================================================================
// 2. HÀM POST SONIC
// =================================================================
function doPostSonic(e) {
  try {
    var data;
    try { data = JSON.parse(e.postData.contents); } catch (err) { return; }

    // CHỐNG TELEGRAM RETRY SPAM TIN NHẮN
    if (data.update_id) {
      var updateKey = "TG_UPDATE_" + data.update_id;
      if (sonicScriptProps.getProperty(updateKey) === "done") {
        return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      sonicScriptProps.setProperty(updateKey, "done");
    }

    // A. TIN NHẮN VĂN BẢN TELEGRAM
    if (data.message && data.message.text) {
      handleSonicTelegramMessage(data.message);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // B. NÚT BẤM TƯƠNG TÁC TELEGRAM (Callback query)
    if (data.callback_query) {
      handleSonicTelegramCallback(data.callback_query);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // C. ĐƠN TỪ FORM WEB HANDLER
    if (data.tenKhach && data.tenDonHang) {
      return handleSonicFormWebPost(data);
    }

    // D. ĐƠN ĐẶT CỌC TỰ ĐỘNG TỪ WEB SONIC
    var sheet = getSonicSheet();
    var now = new Date();
    var timeStr = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");
    var rawCode = (data.transferCode || '').toString().trim();
    var cleanCode = cleanSonicCodeForMatching(rawCode);

    var remainText = tinhSoTienConLai(data.price, data.deposit);

    sonicScriptProps.setProperty("PAID_STATUS_" + cleanCode, "false");

    if (sheet) {
      sheet.appendRow([
        timeStr,
        data.name || '',
        "'" + (data.phone || ''),
        data.address || '',
        data.product || '',
        data.price || '',
        data.deposit || '',
        remainText,        // CỘT H: SỐ TIỀN CÒN LẠI
        rawCode,           // CỘT I: MÃ CK
        'Chờ cọc ⏳',       // CỘT J: TRẠNG THÁI
        data.note || ''    // CỘT K: GHI CHÚ
      ]);
    }

    var msg = 
      "📩 <b>CÓ ĐƠN HÀNG SONIC MỚI (CHỜ CỌC)</b>\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "👤 <b>Khách hàng:</b> " + (data.name || '') + "\n" +
      "📞 <b>SĐT:</b> <code>" + (data.phone || '') + "</code>\n" +
      "🏠 <b>Địa chỉ:</b> " + (data.address || '') + "\n" +
      "📦 <b>Sản phẩm:</b> " + (data.product || '') + "\n" +
      "💵 <b>Giá bán:</b> " + (data.price || '') + "\n" +
      "💰 <b>Cần cọc:</b> <b>" + (data.deposit || '') + "</b>\n" +
      "💵 <b>Còn lại thu COD:</b> <b>" + remainText + "</b>\n" +
      "🏷️ <b>Mã CK:</b> <code>" + rawCode + "</code>\n" +
      "📝 <b>Ghi chú:</b> " + (data.note || 'Không có') + "\n" +
      "⏳ <b>Trạng thái:</b> Chờ cọc ⏳\n" +
      "⏱️ <i>Đơn sẽ tự động hủy nếu không cọc trong 5 phút!</i>";

    var keyboard = {
      inline_keyboard: [
        [{ text: "⚡ XÁC NHẬN ĐÃ CỌC NGAY (TỨC THÌ)", callback_data: "confirm_pay_" + cleanCode }],
        [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }],
        [{ text: "📂 CHECK SHEET CỦ (TMV)", url: SONIC_OLD_SHEET_URL }],
        [{ text: "🌐 LINK ĐẶT HÀNG", url: SONIC_ORDER_WEB_URL }]
      ]
    };

    sendSonicTelegramToAdmins(msg, keyboard);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", conLai: remainText }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
// 3. XỬ LÝ LỆNH TELEGRAM SONIC
// =================================================================
function handleSonicTelegramMessage(msgObj) {
  var text = (msgObj.text || "").trim();
  var chatId = msgObj.chat.id.toString();
  var lowerText = text.toLowerCase();

  if (text === "/start" || text === "/help" || lowerText === "start" || lowerText === "menu") {
    var welcomeMsg = 
      "👋 <b>CHÀO MỪNG BẠN ĐẾN VỚI BOT QUẢN LÝ ĐƠN HÀNG!</b>\n\n" +
      "Bạn có thể gửi tin nhắn lên đơn nhanh bằng cú pháp:\n" +
      "<code>[Tên], [SĐT], [Link FB/Zalo], [Đơn hàng], [Giá], [Cọc]</code>\n\n" +
      "👉 <i>Ví dụ: Nguyễn Văn A, 0987654321, Zalo, Adobe 1 năm, 1000, 800</i>";

    var menuButtons = [
      [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }],
      [{ text: "📂 CHECK SHEET CỦ (TMV)", url: SONIC_OLD_SHEET_URL }],
      [{ text: "🌐 LINK ĐẶT HÀNG", url: SONIC_ORDER_WEB_URL }]
    ];

    sendSonicTelegramRequest("sendMessage", {
      chat_id: chatId,
      text: welcomeMsg,
      parse_mode: "HTML",
      reply_markup: JSON.stringify({ inline_keyboard: menuButtons })
    });
    return;
  }

  var orderData = parseSonicTelegramMessage(text);
  if (orderData) {
    var sheet = getSonicSheet();
    var tongTien = parseFloat(orderData.tongTien) || 0;
    var daCoc = parseFloat(orderData.daCoc) || 0;

    if (tongTien > 0 && tongTien < 10000) tongTien *= 1000;
    if (daCoc > 0 && daCoc < 10000) daCoc *= 1000;

    var conLai = Math.max(0, tongTien - daCoc);
    var formatCurrency = function(val) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val); };

    if (sheet) {
      sheet.appendRow([
        Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss"),
        orderData.tenKhach || '',
        "'" + (orderData.sdt || ''),
        orderData.linkContact || '-',
        orderData.tenDonHang || '',
        formatCurrency(tongTien),
        formatCurrency(daCoc),
        formatCurrency(conLai),
        "Tạo từ Telegram Bot",
        "Đã xác nhận",
        ""
      ]);
    }

    var replyMsg = 
      "✅ <b>LÊN ĐƠN HÀNG THÀNH CÔNG!</b>\n\n" +
      "👤 <b>Khách hàng:</b> " + orderData.tenKhach + "\n" +
      "🔗 <b>Liên hệ:</b> " + orderData.linkContact + "\n" +
      "📞 <b>Số điện thoại:</b> <code>" + orderData.sdt + "</code>\n" +
      "📦 <b>Đơn hàng:</b> " + orderData.tenDonHang + "\n" +
      "💰 <b>Tổng tiền:</b> " + formatCurrency(tongTien) + "\n" +
      "💵 <b>Đã cọc:</b> " + formatCurrency(daCoc) + "\n" +
      "💳 <b>Còn lại COD:</b> <code>" + formatCurrency(conLai) + "</code>\n\n" +
      "📊 <i>Đã đồng bộ thành công vào Google Sheets của bạn.</i>";

    var sheetKeyboard = { 
      inline_keyboard: [
        [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }],
        [{ text: "📂 CHECK SHEET CỦ (TMV)", url: SONIC_OLD_SHEET_URL }]
      ] 
    };

    sendSonicTelegramRequest("sendMessage", {
      chat_id: chatId,
      text: replyMsg,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(sheetKeyboard)
    });
  } else {
    var failMsg = 
      "❌ <b>Tin nhắn sai cú pháp!</b>\n\n" +
      "Hãy gửi tin nhắn chứa ít nhất trường <b>Tên</b> và <b>Đơn</b> theo cú pháp. Hoặc nhấn vào nút bên dưới để lên đơn qua giao diện Web.";

    var failButtons = [
      [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }],
      [{ text: "📂 CHECK SHEET CỦ (TMV)", url: SONIC_OLD_SHEET_URL }],
      [{ text: "🌐 LINK ĐẶT HÀNG", url: SONIC_ORDER_WEB_URL }]
    ];

    sendSonicTelegramRequest("sendMessage", {
      chat_id: chatId,
      text: failMsg,
      parse_mode: "HTML",
      reply_markup: JSON.stringify({ inline_keyboard: failButtons })
    });
  }
}

function parseSonicTelegramMessage(text) {
  if (!text) return null;
  var data = {};
  
  var cleanTextForCheck = text.replace(/https?:\/\//gi, '');
  if (!cleanTextForCheck.includes(':')) {
    var parts = text.split(/[,\;|]/).map(function(item) { return item.trim(); });
    if (parts.length >= 4) {
      data.tenKhach = parts[0];
      data.sdt = parts[1];
      data.linkContact = parts[2];
      data.tenDonHang = parts[3];
      if (parts.length >= 5) data.tongTien = cleanSonicNumber(parts[4]);
      if (parts.length >= 6) data.daCoc = cleanSonicNumber(parts[5]);
      
      if (!data.linkContact) data.linkContact = "-";
      if (!data.sdt) data.sdt = "-";
      if (data.tongTien === undefined) data.tongTien = 0;
      if (data.daCoc === undefined) data.daCoc = 0;
      return data;
    }
  }
  
  var lines = text.split('\n');
  var hasInfo = false;
  
  lines.forEach(function(line) {
    var parts = line.split(':');
    if (parts.length >= 2) {
      var key = parts[0].trim().toLowerCase();
      var val = parts.slice(1).join(':').trim();
      
      if (key.includes('tên') || key.includes('ten') || key.includes('khách') || key.includes('khach')) {
        data.tenKhach = val;
        hasInfo = true;
      } else if (key.includes('link') || key.includes('contact') || key.includes('fb') || key.includes('zalo')) {
        data.linkContact = val;
      } else if (key.includes('sđt') || key.includes('sdt') || key.includes('thoại') || key.includes('thoi')) {
        data.sdt = val;
      } else if (key.includes('đơn') || key.includes('don') || key.includes('hàng') || key.includes('hang')) {
        data.tenDonHang = val;
        hasInfo = true;
      } else if (key.includes('giá') || key.includes('gia') || key.includes('tiền') || key.includes('tien') || key.includes('tổng') || key.includes('tong')) {
        data.tongTien = cleanSonicNumber(val);
      } else if (key.includes('cọc') || key.includes('coc')) {
        data.daCoc = cleanSonicNumber(val);
      }
    }
  });
  
  if (hasInfo && data.tenKhach && data.tenDonHang) {
    if (!data.linkContact) data.linkContact = "-";
    if (!data.sdt) data.sdt = "-";
    if (data.tongTien === undefined) data.tongTien = 0;
    if (data.daCoc === undefined) data.daCoc = 0;
    return data;
  }
  
  return null;
}

function cleanSonicNumber(str) {
  if (!str) return 0;
  var cleaned = str.toString().replace(/[^\d]/g, '');
  return parseFloat(cleaned) || 0;
}

function handleSonicFormWebPost(data) {
  try {
    var sheet = getSonicSheet();
    var tongTien = parseFloat(data.tongTien) || 0;
    var daCoc = parseFloat(data.daCoc) || 0;
    
    if (tongTien > 0 && tongTien < 10000) tongTien *= 1000;
    if (daCoc > 0 && daCoc < 10000) daCoc *= 1000;
    
    var conLai = Math.max(0, tongTien - daCoc);
    var formatCurrency = function(val) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val); };

    if (sheet) {
      sheet.appendRow([
        Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss"),
        data.tenKhach || '',
        "'" + (data.sdt || ''),
        data.linkContact || '-',
        data.tenDonHang || '',
        formatCurrency(tongTien),
        formatCurrency(daCoc),
        formatCurrency(conLai),
        "WEB TMV",
        "Đã xác nhận",
        data.note || ''
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, conLai: formatCurrency(conLai) }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
// 4. QUÉT GMAIL TỐC ĐỘ CAO CHO SONIC
// =================================================================
function checkSonicBankDepositEmails() {
  try {
    var sheet = getSonicSheet();
    if (!sheet) return;

    try {
      var threads = GmailApp.getInboxThreads(0, 10);
      if (threads && threads.length > 0) {
        var values = sheet.getDataRange().getValues();

        threads.forEach(function(thread) {
          var messages = thread.getMessages();
          messages.forEach(function(msg) {
            var rawEmailText = msg.getPlainBody() + " " + msg.getBody() + " " + msg.getSubject();
            var cleanContent = cleanSonicCodeForMatching(rawEmailText);

            for (var i = 1; i < values.length; i++) {
              var row = values[i];
              var codeInfo = findSonicCodeInRow(row);
              
              if (codeInfo && codeInfo.code) {
                var cleanCode = codeInfo.code;
                var rawCode = codeInfo.raw;
                var status = getSonicRowStatus(row);

                if (cleanContent.indexOf(cleanCode) !== -1) {
                  if (sonicScriptProps.getProperty("PAID_STATUS_" + cleanCode) === "true") {
                    return;
                  }

                  sonicScriptProps.setProperty("PAID_STATUS_" + cleanCode, "true");

                  if (status.includes('Chờ') || status === "") {
                    updateSonicRowStatus(sheet, i + 1, 'ĐÃ CỌC ✅');

                    var confirmMsg = 
                      "🎉 <b>XÁC NHẬN TIỀN CỌC TIMO THÀNH CÔNG!</b>\n" +
                      "━━━━━━━━━━━━━━━━━━\n" +
                      "👤 <b>Khách hàng:</b> " + row[1] + "\n" +
                      "📞 <b>SĐT:</b> <code>" + row[2] + "</code>\n" +
                      "🏠 <b>Địa chỉ:</b> " + row[3] + "\n" +
                      "📦 <b>Sản phẩm:</b> " + row[4] + "\n" +
                      "💰 <b>Đã nhận cọc:</b> <b>" + row[6] + "</b>\n" +
                      "💵 <b>Còn lại thu COD:</b> <b>" + (row[7] || '0đ') + "</b>\n" +
                      "🏷️ <b>Mã CK:</b> <code>" + rawCode + "</code>\n" +
                      "📝 <b>Ghi chú:</b> " + (row[10] || 'Không có') + "\n" +
                      "✅ <b>Trạng thái mới:</b> ĐÃ CỌC ✅";
                      
                    var sheetKeyboard = {
                      inline_keyboard: [
                        [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }],
                        [{ text: "📂 CHECK SHEET CỦ (TMV)", url: SONIC_OLD_SHEET_URL }]
                      ]
                    };

                    sendSonicTelegramToAdmins(confirmMsg, sheetKeyboard);
                  }
                }
              }
            }
          });
        });
      }
    } catch (errMail) {
      Logger.log("Lỗi đọc mail Sonic: " + errMail.toString());
    }

    try {
      cleanupSonicExpiredPendingOrders(sheet);
    } catch (errClean) {
      Logger.log("Lỗi dọn đơn Sonic: " + errClean.toString());
    }

  } catch (err) {
    Logger.log("Lỗi checkSonicBankDepositEmails: " + err.toString());
  }
}

// Alias tương thích ngược cho Trigger cũ trên Google Apps Script
function checkBankDepositEmails() {
  checkSonicBankDepositEmails();
}

// =================================================================
// 5. HÀM HỦY & XÓA ĐƠN CHỜ QUÁ 5 PHÚT KHỎI SHEET SONIC
// =================================================================
function cleanupSonicExpiredPendingOrders(sheet) {
  try {
    var values = sheet.getDataRange().getValues();
    if (!values || values.length <= 1) return;

    var now = new Date().getTime();
    var FIVE_MINUTES_MS = 5 * 60 * 1000;

    for (var i = values.length - 1; i >= 1; i--) {
      var row = values[i];
      if (!row || row.length < 5) continue;

      var dateStr = row[0];
      var codeInfo = findSonicCodeInRow(row);
      var status = getSonicRowStatus(row);

      if (codeInfo && (status.includes('Chờ') || status === "")) {
        var cleanCode = codeInfo.code;
        var orderDate = parseVietDateTime(dateStr);
        if (orderDate && !isNaN(orderDate.getTime())) {
          var ageMs = now - orderDate.getTime();
          if (ageMs > FIVE_MINUTES_MS) {
            sonicScriptProps.deleteProperty("PAID_STATUS_" + cleanCode);
            sheet.deleteRow(i + 1);

            var cancelMsg = 
              "🗑️ <b>TỰ ĐỘNG HỦY ĐƠN (QUÁ 5 PHÚT CHƯA CỌC)</b>\n" +
              "━━━━━━━━━━━━━━━━━━\n" +
              "👤 <b>Khách hàng:</b> " + (row[1] || 'Vô danh') + " (<code>" + (row[2] || '') + "</code>)\n" +
              "🏷️ <b>Mã CK:</b> <code>" + codeInfo.raw + "</code>\n" +
              "⏰ <b>Lý do:</b> Quá 5 phút không cọc (Đã xóa khỏi Sheet).";
            
            var sheetKeyboard = {
              inline_keyboard: [
                [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }]
              ]
            };

            sendSonicTelegramToAdmins(cancelMsg, sheetKeyboard);
          }
        }
      }
    }
  } catch (e) {
    Logger.log("Lỗi cleanupSonicExpiredPendingOrders: " + e.toString());
  }
}

// =================================================================
// 6. XỬ LÝ NÚT BẤM CALLBACK TRÊN TELEGRAM BOT MENU SONIC
// =================================================================
function handleSonicTelegramCallback(callbackQuery) {
  var data = callbackQuery.data;
  var chatId = callbackQuery.message.chat.id.toString();

  sendSonicTelegramRequest("answerCallbackQuery", { callback_query_id: callbackQuery.id });

  if (data && data.indexOf("confirm_pay_") === 0) {
    var cleanCode = data.replace("confirm_pay_", "");
    
    if (sonicScriptProps.getProperty("PAID_STATUS_" + cleanCode) === "true") {
      return;
    }

    sonicScriptProps.setProperty("PAID_STATUS_" + cleanCode, "true");
    updateSonicRowStatusByCode(cleanCode, 'ĐÃ CỌC ✅');

    var sheetKeyboard = {
      inline_keyboard: [
        [{ text: "📊 CHECK SHEET MỚI (SONIC)", url: SONIC_SHEET_URL }],
        [{ text: "📂 CHECK SHEET CỦ (TMV)", url: SONIC_OLD_SHEET_URL }]
      ]
    };

    sendSonicTelegramRequest("sendMessage", {
      chat_id: chatId,
      text: "✅ <b>ĐÃ XÁC NHẬN CỌC THỦ CÔNG TỪ TELEGRAM!</b>\nMã CK: <code>" + cleanCode + "</code>\nMàn hình Web khách đã tự động chuyển sang Popup Thành công!",
      parse_mode: "HTML",
      reply_markup: JSON.stringify(sheetKeyboard)
    });
  }
}

// =================================================================
// 7. CÁC HÀM PHỤ TRỢ SONIC
// =================================================================
function findSonicCodeInRow(row) {
  if (!row || !row.length) return null;
  // Check column I (Index 8: Mã CK) first for precision
  if (row[8]) {
    var rawCol8 = (row[8] || "").toString().trim();
    var cleanCol8 = cleanSonicCodeForMatching(rawCol8);
    if (cleanCol8 && cleanCol8.length >= 6 && /[A-Z0-9]{3,}\d{3,}$/.test(cleanCol8)) {
      return { code: cleanCol8, raw: rawCol8, colIdx: 8 };
    }
  }
  // Fallback to checking all columns
  for (var c = 0; c < row.length; c++) {
    var raw = (row[c] || "").toString().trim();
    var clean = cleanSonicCodeForMatching(raw);
    if (clean && clean.length >= 6 && /[A-Z0-9]{3,}\d{3,}$/.test(clean)) {
      return { code: clean, raw: raw, colIdx: c };
    }
  }
  return null;
}

function getSonicRowStatus(row) {
  if (!row) return "";
  for (var c = 0; c < row.length; c++) {
    var val = (row[c] || "").toString();
    if (val.includes("Chờ") || val.includes("ĐÃ CỌC") || val.includes("Đã nhận")) {
      return val;
    }
  }
  return (row[9] || "").toString();
}

function updateSonicRowStatus(sheet, rowLine, newStatus) {
  try {
    var rowValues = sheet.getRange(rowLine, 1, 1, 12).getValues()[0];
    for (var c = 0; c < rowValues.length; c++) {
      var val = (rowValues[c] || "").toString();
      if (val.includes("Chờ") || val === "") {
        sheet.getRange(rowLine, c + 1).setValue(newStatus);
        return;
      }
    }
    sheet.getRange(rowLine, 10).setValue(newStatus);
  } catch(e) {}
}

function cleanSonicCodeForMatching(str) {
  if (!str) return "";
  return str.toString()
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function tinhSoTienConLai(priceStr, depositStr) {
  var price = parseInt((priceStr || '').toString().replace(/\D/g, ''), 10) || 0;
  var deposit = parseInt((depositStr || '').toString().replace(/\D/g, ''), 10) || 0;
  var remain = Math.max(0, price - deposit);
  return new Intl.NumberFormat('de-DE').format(remain) + 'đ';
}

function parseVietDateTime(dateStr) {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return null;
  try {
    var parts = dateStr.toString().trim().split(" ");
    if (parts.length < 2) return new Date(dateStr);
    var dParts = parts[0].split("/");
    var tParts = parts[1].split(":");
    return new Date(dParts[2], dParts[1] - 1, dParts[0], tParts[0], tParts[1], tParts[2] || 0);
  } catch(e) {
    return null;
  }
}

function checkSonicSheetPaidStatus(cleanSearchCode) {
  try {
    var sheet = getSonicSheet();
    if (!sheet) return false;
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var codeInfo = findSonicCodeInRow(row);
      var status = getSonicRowStatus(row);
      if (codeInfo && codeInfo.code === cleanSearchCode) {
        if (status.includes("ĐÃ CỌC") || status.includes("Đã nhận cọc") || status.includes("Thành công")) {
          return true;
        }
      }
    }
  } catch(e) {}
  return false;
}

function updateSonicRowStatusByCode(cleanSearchCode, newStatus) {
  try {
    var sheet = getSonicSheet();
    if (!sheet) return;
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var codeInfo = findSonicCodeInRow(row);
      if (codeInfo && codeInfo.code === cleanSearchCode) {
        updateSonicRowStatus(sheet, i + 1, newStatus);
        break;
      }
    }
  } catch(e) {}
}

function sendSonicTelegramToAdmins(message, replyMarkup) {
  SONIC_ADMIN_CHAT_IDS.forEach(function(chatId) {
    var payload = { chat_id: chatId, text: message, parse_mode: "HTML" };
    if (replyMarkup) payload.reply_markup = JSON.stringify(replyMarkup);
    sendSonicTelegramRequest("sendMessage", payload);
  });
}

function sendSonicTelegramRequest(method, payload) {
  var url = "https://api.telegram.org/bot" + SONIC_TELEGRAM_TOKEN + "/" + method;
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true });
}

// =================================================================
// BỘ ĐIỀU HƯỚNG TỔNG DO GET / DO POST (CHỐNG XUNG ĐỘT KHI ĐỂ CHUNG PROJECT)
// Chạy hàm gốc của Magimir khi nhận request Magimir
// =================================================================
function handleMagimirDoGetOriginal(e) {
  var params = e ? e.parameter : {};
  var result = {};
  
  if (params && params.action === "save_trial_email") {
    var email = params.email;
    var code = params.code;
    var price = params.price;
    var prize = params.prize;
    if (email && code) {
      var regexEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (email.trim().toLowerCase() !== "dùng chung (manual)" && !regexEmail.test(email.trim().toLowerCase())) {
        result = { status: "error", message: "Invalid email format or domain" };
      } else {
        var sp = PropertiesService.getScriptProperties();
        var cleanCode = code.toUpperCase().replace(/\s+/g, '');
        sp.setProperty("EMAIL_FOR_CODE_" + cleanCode, email.trim());
        if (price !== undefined && price !== "") {
          sp.setProperty("PRICE_FOR_CODE_" + cleanCode, price.toString().trim());
          sp.setProperty("PRICE_FOR_EMAIL_" + email.trim().toLowerCase(), price.toString().trim());
        }
        if (prize !== undefined && prize !== "") {
          sp.setProperty("PRIZE_FOR_CODE_" + cleanCode, prize.trim());
          sp.setProperty("PRIZE_FOR_EMAIL_" + email.trim().toLowerCase(), prize.trim());
        }
        result = { status: "success", email: email, code: cleanCode };
      }
    } else {
      result = { status: "error", message: "Missing parameters" };
    }
  } 
  else if (params && params.action === "check_payment_status") {
    var code = params.code;
    if (code) {
      var sp = PropertiesService.getScriptProperties();
      var cleanCode = code.toUpperCase().replace(/\s+/g, '');
      var isPaid = sp.getProperty("PAID_STATUS_" + cleanCode);
      if (isPaid === "true") {
        result = { status: "paid" };
      } else {
        result = { status: "pending" };
      }
    } else {
      result = { status: "error", message: "Missing code parameter" };
    }
  } 
  else if (params && params.action === "save_spin_result") {
    var code = params.code;
    var email = params.email || "";
    var prize = params.prize;
    if (code && prize) {
      var cleanCode = code.toUpperCase().replace(/\s+/g, '');
      if (typeof saveSpinResult === "function") {
        result = saveSpinResult(cleanCode, email, prize);
      } else {
        result = { status: "error", message: "saveSpinResult function not available" };
      }
    } else {
      result = { status: "error", message: "Missing code or prize parameters" };
    }
  }
  else {
    result = { status: "error", message: "Invalid action" };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON);
}

function handleMagimirDoPostOriginal(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return; }

  if (data && data.action === "save_trial_email") {
    var email = data.email;
    var code = data.code;
    var price = data.price;
    var prize = data.prize;
    if (email && code) {
      var regexEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (email.trim().toLowerCase() !== "dùng chung (manual)" && !regexEmail.test(email.trim().toLowerCase())) {
         return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid email format or domain" }))
                              .setMimeType(ContentService.MimeType.JSON);
      }
      var sp = PropertiesService.getScriptProperties();
      var cleanCode = code.toUpperCase().replace(/\s+/g, '');
      sp.setProperty("EMAIL_FOR_CODE_" + cleanCode, email.trim());
      if (price !== undefined && price !== "") {
        sp.setProperty("PRICE_FOR_CODE_" + cleanCode, price.toString().trim());
        sp.setProperty("PRICE_FOR_EMAIL_" + email.trim().toLowerCase(), price.toString().trim());
      }
      if (prize !== undefined && prize !== "") {
        sp.setProperty("PRIZE_FOR_CODE_" + cleanCode, prize.trim());
        sp.setProperty("PRIZE_FOR_EMAIL_" + email.trim().toLowerCase(), prize.trim());
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing params" }))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  var message = data.message;
  var callbackQuery = data.callback_query;

  if (callbackQuery && typeof handleCallback === "function") {
    handleCallback(callbackQuery);
  }
  else if (message && typeof handleMessage === "function") {
    handleMessage(message);
  }
}

function doGet(e) {
  var params = e ? e.parameter : {};
  if (params && (params.action === "save_trial_email" || params.action === "save_spin_result")) {
    return handleMagimirDoGetOriginal(e);
  }
  if (params && params.action === "check_payment_status") {
    var code = (params.code || "").toUpperCase().trim();
    if (code.indexOf("MGM") === 0) {
      return handleMagimirDoGetOriginal(e);
    }
    return doGetSonic(e);
  }
  return doGetSonic(e);
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) {}
    }

    if (data && data.action === "save_trial_email") {
      return handleMagimirDoPostOriginal(e);
    }

    if (data && data.callback_query) {
      var cbData = data.callback_query.data || "";
      if (cbData.indexOf("confirm_pay_") === 0) {
        return doPostSonic(e);
      }
      return handleMagimirDoPostOriginal(e);
    }

    if (data && data.message) {
      var chatId = data.message.chat ? data.message.chat.id.toString() : "";
      var magimirStep = PropertiesService.getUserProperties().getProperty("step_" + chatId);
      if (magimirStep) {
        return handleMagimirDoPostOriginal(e);
      }

      var text = (data.message.text || "").trim();
      if (text === "/start" || text === "/help" || text.toLowerCase() === "start" || text.toLowerCase() === "menu") {
        return doPostSonic(e);
      }

      if (data.tenKhach && data.tenDonHang) {
        return doPostSonic(e);
      }

      if (typeof parseSonicTelegramMessage === "function" && parseSonicTelegramMessage(text)) {
        return doPostSonic(e);
      }

      return handleMagimirDoPostOriginal(e);
    }

    if (data && (data.transferCode || data.product)) {
      return doPostSonic(e);
    }

    return doPostSonic(e);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
