// =========================================================================
// CẤU HÌNH HỆ THỐNG QUẢN LÝ ĐƠN HÀNG (TELEGRAM BOT & WEB APP GOOGLE SHEETS)
// Bot Token: 8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY
// Admin Chat IDs: 7744946591, 7607846055
// Spreadsheet ID: 15mW6V31uoKEo0NNBWXQEdYuuaSay04clNz4DLUz36UM
// =========================================================================

// 1. Token Telegram Bot do @BotFather cung cấp
var TELEGRAM_TOKEN = "8795810475:AAGiayX1izlJd8uUxtQAAThE-MffI_KoPKY";
var SONIC_TELEGRAM_TOKEN = TELEGRAM_TOKEN;

// 2. Chat ID Bảo mật (Để rỗng "" nếu cho phép tất cả mọi người nhắn bot tạo đơn)
var ALLOWED_CHAT_ID = ""; 
var SONIC_ADMIN_CHAT_IDS = ["7744946591", "7607846055"];

// 3. Đường link & ID Google Sheets quản lý đơn hàng
var SONIC_SPREADSHEET_ID = "15mW6V31uoKEo0NNBWXQEdYuuaSay04clNz4DLUz36UM";
var GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/" + SONIC_SPREADSHEET_ID + "/edit?gid=0#gid=0";
var SONIC_SHEET_URL = GOOGLE_SHEET_URL;

var SONIC_OLD_SPREADSHEET_ID = "15GrO9Y9hyLQ4PhjggVAqMkmZ_W-9MsDtr0r3SnvLxeo";
var SONIC_OLD_SHEET_URL = "https://docs.google.com/spreadsheets/d/" + SONIC_OLD_SPREADSHEET_ID + "/edit";

// 4. Đường link trang web đặt hàng & Web App Execution URL
var ORDER_WEB_URL = "https://www.tungmuvang.in/p/at-hang.html";
var SONIC_ORDER_WEB_URL = ORDER_WEB_URL;
var SONIC_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZg6wWKe_yuV9UgZv2dBquCLNPYPyTqxi0urqcquf9lYdUTNqE0DAN9N8y9g3fXJEj/exec";

var sonicScriptProps = PropertiesService.getScriptProperties();

// =========================================================================
// HÀM LẤY SHEET VÀ TỰ ĐỘNG KHỞI TẠO TIÊU ĐỀ 11 CỘT CHUẨN KHI SHEET TRỐNG
// =========================================================================
function getSonicSheet() {
  var TARGET_ID = "15mW6V31uoKEo0NNBWXQEdYuuaSay04clNz4DLUz36UM";
  var sheet = null;

  try {
    var ss = SpreadsheetApp.openById(TARGET_ID);
    if (ss) sheet = ss.getSheets()[0];
  } catch (e) {
    Logger.log("Lỗi openById target Sheet (" + TARGET_ID + "): " + e.toString());
  }

  if (!sheet) {
    try {
      var activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSs && activeSs.getId() === TARGET_ID) {
        sheet = activeSs.getSheets()[0];
      }
    } catch (e) {}
  }

  // Tự động kiểm tra và tạo dòng tiêu đề chuẩn 11 cột nếu Sheet chưa có dữ liệu
  if (sheet && sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Thời gian",          // Cột A
      "Tên khách hàng",     // Cột B
      "Địa chỉ người nhận", // Cột C (Thay cho Link FB/Zalo)
      "Số điện thoại",      // Cột D
      "Tên đơn hàng",       // Cột E
      "Tổng tiền",          // Cột F
      "Đã cọc",             // Cột G
      "Còn lại",            // Cột H
      "Lưu ý / Ghi chú",    // Cột I (Thay cho Nguồn)
      "Trạng thái",         // Cột J
      "Tiến độ"             // Cột K
    ]);
  }

  return sheet;
}

// =========================================================================
// 1. HÀM KHỞI TẠO WEB APP (doGet)
// =========================================================================
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

function doGetSonic(e) {
  var params = e ? e.parameter : {};
  var callback = params.callback;
  var result = {};

  if (params && params.action === "check_payment_status") {
    var code = params.code;
    if (code) {
      var cleanCode = cleanSonicCodeForMatching(code);
      checkSonicBankDepositEmailsThrottled();

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

// =========================================================================
// 2. API LƯU ĐƠN HÀNG TỪ FORM HTML TRỰC TIẾP (saveOrderFromForm)
// =========================================================================
function saveOrderFromForm(data) {
  try {
    var sheet = getSonicSheet();
    if (!sheet) return { success: false, message: "Không thể mở Google Sheet!" };

    var tongTien = parseFloat(data.tongTien) || 0;
    var daCoc = parseFloat(data.daCoc) || 0;
    
    // Tự động quy đổi viết tắt (ví dụ: 1000 -> 1.000.000, 800 -> 800.000)
    if (tongTien > 0 && tongTien < 10000) tongTien *= 1000;
    if (daCoc > 0 && daCoc < 10000) daCoc *= 1000;
    
    var conLai = Math.max(0, tongTien - daCoc);
    var formatCurrency = function(val) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val); };

    var rowData = [
      Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss"), // Cột A: Thời gian
      data.tenKhach || '',                                              // Cột B: Tên khách hàng
      data.address || data.linkContact || '-',                           // Cột C: Địa chỉ người nhận (Thay cho Link FB/Zalo)
      "'" + (data.sdt || ''),                                           // Cột D: Số điện thoại
      data.tenDonHang || '',                                            // Cột E: Tên đơn hàng
      formatCurrency(tongTien),                                         // Cột F: Tổng tiền
      formatCurrency(daCoc),                                            // Cột G: Đã cọc
      formatCurrency(conLai),                                           // Cột H: Còn lại
      data.note || "Tạo từ Form Web",                                   // Cột I: Lưu ý / Ghi chú
      "Đã xác nhận",                                                    // Cột J: Trạng thái
      "Chưa làm"                                                        // Cột K: Tiến độ
    ];
    
    sheet.appendRow(rowData);
    return { success: true, message: "Lưu đơn hàng thành công!", conLai: formatCurrency(conLai) };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// =========================================================================
// 3. XỬ LÝ SỰ KIỆN POST (doPost & doPostSonic)
// =========================================================================
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

    var noteCombined = (data.note ? data.note : "");
    if (rawCode) {
      noteCombined = noteCombined ? noteCombined + " | Mã CK: " + rawCode : "Mã CK: " + rawCode;
    }

    if (sheet) {
      sheet.appendRow([
        timeStr,                  // Cột A: Thời gian
        data.name || '',          // Cột B: Tên khách hàng
        data.address || '',       // Cột C: Địa chỉ người nhận (Thay cho Link FB/Zalo)
        "'" + (data.phone || ''), // Cột D: Số điện thoại
        data.product || '',       // Cột E: Tên đơn hàng
        data.price || '',         // Cột F: Tổng tiền
        data.deposit || '',       // Cột G: Đã cọc
        remainText,               // Cột H: Còn lại
        noteCombined,             // Cột I: Lưu ý / Ghi chú
        'Chờ cọc ⏳',              // Cột J: Trạng thái
        'Chưa làm'                // Cột K: Tiến độ
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
      "⏱️ <i>Đơn sẽ tự động hủy nếu không cọc trong 15 phút!</i>";

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

// =========================================================================
// 4. XỬ LÝ LỆNH VĂN BẢN TỪ TELEGRAM BOT
// =========================================================================
function handleSonicTelegramMessage(msgObj) {
  var text = (msgObj.text || "").trim();
  var chatId = msgObj.chat.id.toString();
  var lowerText = text.toLowerCase();

  // Kiểm tra quyền hạn Chat ID nếu có cài đặt
  if (ALLOWED_CHAT_ID && ALLOWED_CHAT_ID !== "" && chatId !== ALLOWED_CHAT_ID.toString()) {
    sendTelegramMessage(chatId, "⚠️ Bạn không có quyền sử dụng Bot này. Chat ID của bạn: `" + chatId + "`");
    return;
  }

  if (text === "/start" || text === "/help" || lowerText === "start" || lowerText === "menu") {
    var welcomeMsg = 
      "👋 <b>CHÀO MỪNG BẠN ĐẾN VỚI BOT QUẢN LÝ ĐƠN HÀNG!</b>\n\n" +
      "Bạn có thể gửi tin nhắn lên đơn nhanh chóng bằng 2 cách:\n\n" +
      "<b>Cách 1: Gửi 1 dòng cách nhau bằng dấu phẩy:</b>\n" +
      "<code>[Tên], [SĐT], [Địa chỉ/Zalo], [Đơn hàng], [Giá], [Cọc]</code>\n" +
      "👉 Ví dụ: <code>Nguyễn Văn A, 0987654321, Hà Nội, Mô Hình Sonic 30cm, 850000, 200000</code>\n\n" +
      "<b>Cách 2: Gửi tin nhắn theo cú pháp từng dòng:</b>\n" +
      "Tên: [Tên khách hàng]\n" +
      "SĐT: [Số điện thoại]\n" +
      "Địa chỉ: [Địa chỉ người nhận]\n" +
      "Đơn: [Tên đơn hàng]\n" +
      "Giá: [Tổng tiền]\n" +
      "Cọc: [Đã cọc]";

    var menuButtons = [
      [{ text: "🌐 Tạo Đơn Hàng Qua Web", url: ORDER_WEB_URL }],
      [{ text: "📊 Kiểm Tra Đơn Hàng (Sheet)", url: GOOGLE_SHEET_URL }]
    ];

    sendSonicTelegramRequest("sendMessage", {
      chat_id: chatId,
      text: welcomeMsg,
      parse_mode: "HTML",
      reply_markup: JSON.stringify({ inline_keyboard: menuButtons })
    });
    return;
  }

  var orderData = parseTelegramMessage(text);
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
        Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss"), // Cột A: Thời gian
        orderData.tenKhach || '',        // Cột B: Tên khách hàng
        orderData.address || orderData.linkContact || '-', // Cột C: Địa chỉ người nhận (Thay cho Link FB/Zalo)
        "'" + (orderData.sdt || ''),     // Cột D: Số điện thoại
        orderData.tenDonHang || '',      // Cột E: Tên đơn hàng
        formatCurrency(tongTien),        // Cột F: Tổng tiền
        formatCurrency(daCoc),          // Cột G: Đã cọc
        formatCurrency(conLai),         // Cột H: Còn lại
        "Tạo từ Telegram Bot",          // Cột I: Lưu ý / Ghi chú
        "Đã xác nhận",                  // Cột J: Trạng thái
        "Chưa làm"                      // Cột K: Tiến độ
      ]);
    }

    var replyMsg = 
      "✅ <b>LÊN ĐƠN HÀNG THÀNH CÔNG!</b>\n\n" +
      "👤 <b>Khách hàng:</b> " + orderData.tenKhach + "\n" +
      "🏠 <b>Địa chỉ:</b> " + (orderData.address || orderData.linkContact || '-') + "\n" +
      "📞 <b>Số điện thoại:</b> <code>" + orderData.sdt + "</code>\n" +
      "📦 <b>Đơn hàng:</b> " + orderData.tenDonHang + "\n" +
      "💰 <b>Tổng tiền:</b> " + formatCurrency(tongTien) + "\n" +
      "💵 <b>Đã cọc:</b> " + formatCurrency(daCoc) + "\n" +
      "💳 <b>Còn lại COD:</b> <code>" + formatCurrency(conLai) + "</code>\n\n" +
      "📊 <i>Đã đồng bộ thành công vào Google Sheets của bạn.</i>";

    var sheetKeyboard = { 
      inline_keyboard: [
        [{ text: "📊 CHECK SHEET ĐƠN HÀNG", url: GOOGLE_SHEET_URL }]
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
      [{ text: "🌐 Tạo Đơn Hàng Qua Web", url: ORDER_WEB_URL }],
      [{ text: "📊 Kiểm Tra Đơn Hàng (Sheet)", url: GOOGLE_SHEET_URL }]
    ];

    sendSonicTelegramRequest("sendMessage", {
      chat_id: chatId,
      text: failMsg,
      parse_mode: "HTML",
      reply_markup: JSON.stringify({ inline_keyboard: failButtons })
    });
  }
}

// =========================================================================
// 5. CÁC HÀM PHÂN TÍCH TIN NHẮN VĂN BẢN & LÀM SẠCH SỐ (PARSER)
// =========================================================================
function parseTelegramMessage(text) {
  if (!text) return null;
  var data = {};
  
  // 1. KIỂM TRA ĐỊNH DẠNG SHORTHAND (Cách nhau bởi dấu phẩy, chấm phẩy hoặc gạch đứng)
  var cleanTextForCheck = text.replace(/https?:\/\//gi, '');
  if (!cleanTextForCheck.includes(':')) {
    var parts = text.split(/[,\;|]/).map(function(item) { return item.trim(); });
    if (parts.length >= 4) {
      data.tenKhach = parts[0];
      data.sdt = parts[1];
      data.address = parts[2];
      data.linkContact = parts[2];
      data.tenDonHang = parts[3];
      if (parts.length >= 5) data.tongTien = cleanNumber(parts[4]);
      if (parts.length >= 6) data.daCoc = cleanNumber(parts[5]);
      
      if (!data.address) data.address = "-";
      if (!data.linkContact) data.linkContact = "-";
      if (!data.sdt) data.sdt = "-";
      if (data.tongTien === undefined) data.tongTien = 0;
      if (data.daCoc === undefined) data.daCoc = 0;
      return data;
    }
  }
  
  // 2. ĐỊNH DẠNG TRUYỀN THỐNG (Cú pháp Tên: ... SĐT: ... Địa chỉ: ...)
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
      } else if (key.includes('địa chỉ') || key.includes('dia chi') || key.includes('đc') || key.includes('dc') || key.includes('link') || key.includes('contact') || key.includes('fb') || key.includes('zalo')) {
        data.address = val;
        data.linkContact = val;
      } else if (key.includes('sđt') || key.includes('sdt') || key.includes('thoại') || key.includes('thoi')) {
        data.sdt = val;
      } else if (key.includes('đơn') || key.includes('don') || key.includes('hàng') || key.includes('hang')) {
        data.tenDonHang = val;
        hasInfo = true;
      } else if (key.includes('giá') || key.includes('gia') || key.includes('tiền') || key.includes('tien') || key.includes('tổng') || key.includes('tong')) {
        data.tongTien = cleanNumber(val);
      } else if (key.includes('cọc') || key.includes('coc')) {
        data.daCoc = cleanNumber(val);
      }
    }
  });
  
  if (hasInfo && data.tenKhach && data.tenDonHang) {
    if (!data.address) data.address = "-";
    if (!data.linkContact) data.linkContact = "-";
    if (!data.sdt) data.sdt = "-";
    if (data.tongTien === undefined) data.tongTien = 0;
    if (data.daCoc === undefined) data.daCoc = 0;
    return data;
  }
  
  return null;
}

function parseSonicTelegramMessage(text) {
  return parseTelegramMessage(text);
}

function cleanNumber(str) {
  if (!str) return 0;
  var cleaned = str.toString().replace(/[^\d]/g, '');
  return parseFloat(cleaned) || 0;
}

function cleanSonicNumber(str) {
  return cleanNumber(str);
}

// =========================================================================
// 6. GỬI TIN NHẮN VÀ BUTTONS QUA TELEGRAM BOT
// =========================================================================
function sendTelegramMessage(chatId, text) {
  sendSonicTelegramRequest("sendMessage", {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  });
}

function sendTelegramMessageWithButtons(chatId, text, buttons) {
  var keyboard = buttons.map(function(btn) {
    return [{ text: btn.text, url: btn.url }];
  });
  
  sendSonicTelegramRequest("sendMessage", {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    reply_markup: JSON.stringify({ inline_keyboard: keyboard })
  });
}

// =========================================================================
// 7. QUÉT GMAIL TỐC ĐỘ CAO VÀ XÁC NHẬN CỌC TIMO TỰ ĐỘNG
// =========================================================================
function checkSonicBankDepositEmailsThrottled() {
  try {
    var lastCheck = parseInt(sonicScriptProps.getProperty("LAST_GMAIL_CHECK_TIME") || "0", 10);
    var now = new Date().getTime();
    if (now - lastCheck < 6000) return; 
    sonicScriptProps.setProperty("LAST_GMAIL_CHECK_TIME", now.toString());
    checkSonicBankDepositEmails();
  } catch(e) {}
}

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
                      "🏠 <b>Địa chỉ:</b> " + (row[2] || 'Chưa ghi') + "\n" +
                      "📞 <b>SĐT:</b> <code>" + row[3] + "</code>\n" +
                      "📦 <b>Sản phẩm:</b> " + row[4] + "\n" +
                      "💰 <b>Đã nhận cọc:</b> <b>" + row[6] + "</b>\n" +
                      "💵 <b>Còn lại thu COD:</b> <b>" + (row[7] || '0đ') + "</b>\n" +
                      "🏷️ <b>Mã CK:</b> <code>" + rawCode + "</code>\n" +
                      "📝 <b>Lưu ý/Ghi chú:</b> " + (row[8] || 'Không có') + "\n" +
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

function checkBankDepositEmails() {
  checkSonicBankDepositEmails();
}

function cleanupSonicExpiredPendingOrders(sheet) {
  try {
    if (!sheet) sheet = getSonicSheet();
    if (!sheet) return;

    var values = sheet.getDataRange().getValues();
    if (!values || values.length <= 1) return;

    var now = new Date().getTime();
    var FIFTEEN_MINUTES_MS = 15 * 60 * 1000; // 15 phút

    for (var i = values.length - 1; i >= 1; i--) {
      var row = values[i];
      if (!row || row.length < 3) continue;

      var dateStr = row[0];
      var codeInfo = findSonicCodeInRow(row);
      var status = (row[9] || getSonicRowStatus(row) || "").toString();

      // Hủy mọi đơn hàng ở trạng thái 'Chờ' (ví dụ: Chờ cọc ⏳) hoặc chưa có trạng thái
      if (status.indexOf('Chờ') !== -1 || status.trim() === "") {
        var orderDate = parseVietDateTime(dateStr);
        if (orderDate && !isNaN(orderDate.getTime())) {
          var ageMs = now - orderDate.getTime();
          if (ageMs >= FIFTEEN_MINUTES_MS) {
            if (codeInfo && codeInfo.code) {
              sonicScriptProps.deleteProperty("PAID_STATUS_" + codeInfo.code);
            }

            var customerName = row[1] || 'Khách lẻ';
            var customerPhone = row[3] || row[2] || '';
            var productName = row[4] || '';
            var rawCode = codeInfo ? codeInfo.raw : (row[8] || 'Không có');

            // Xóa dòng đơn hàng quá 15 phút khỏi Sheet
            sheet.deleteRow(i + 1);

            var cancelMsg = 
              "🗑️ <b>TỰ ĐỘNG HỦY ĐƠN (QUÁ 15 PHÚT CHƯA CỌC)</b>\n" +
              "━━━━━━━━━━━━━━━━━━\n" +
              "👤 <b>Khách hàng:</b> " + customerName + "\n" +
              "📞 <b>SĐT:</b> <code>" + customerPhone + "</code>\n" +
              "📦 <b>Sản phẩm:</b> " + productName + "\n" +
              "🏷️ <b>Mã CK / Ghi chú:</b> <code>" + rawCode + "</code>\n" +
              "⏰ <b>Lý do:</b> Quá 15 phút không cọc (Đã tự động xóa khỏi Sheet).";
            
            var sheetKeyboard = {
              inline_keyboard: [
                [{ text: "📊 CHECK SHEET ĐƠN HÀNG", url: GOOGLE_SHEET_URL }]
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
        [{ text: "📊 CHECK SHEET MỚI", url: GOOGLE_SHEET_URL }]
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

// =========================================================================
// 8. CÁC HÀM TIỆN ÍCH QUẢN LÝ ROW GS & ĐIỀU HƯỚNG BẢO MẬT
// =========================================================================
function findSonicCodeInRow(row) {
  if (!row || !row.length) return null;
  if (row[8]) {
    var rawCol8 = (row[8] || "").toString().trim();
    var cleanCol8 = cleanSonicCodeForMatching(rawCol8);
    if (cleanCol8 && cleanCol8.length >= 6 && /[A-Z0-9]{3,}\d{3,}$/.test(cleanCol8)) {
      return { code: cleanCol8, raw: rawCol8, colIdx: 8 };
    }
  }
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

function parseVietDateTime(dateVal) {
  if (dateVal instanceof Date) return dateVal;
  if (!dateVal) return null;
  try {
    var str = dateVal.toString().trim();
    var parts = str.split(" ");
    if (parts.length >= 2 && parts[0].indexOf("/") !== -1) {
      var dParts = parts[0].split("/");
      var tParts = parts[1].split(":");
      if (dParts.length === 3) {
        var day = parseInt(dParts[0], 10);
        var month = parseInt(dParts[1], 10) - 1;
        var year = parseInt(dParts[2], 10);
        var hour = parseInt(tParts[0], 10) || 0;
        var min = parseInt(tParts[1], 10) || 0;
        var sec = parseInt(tParts[2], 10) || 0;
        return new Date(year, month, day, hour, min, sec);
      }
    }
    var parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch(e) {}
  return null;
}

function runAutoCancelCheck() {
  var sheet = getSonicSheet();
  if (sheet) {
    cleanupSonicExpiredPendingOrders(sheet);
    Logger.log("✅ Đã chạy kiểm tra tự động hủy đơn quá 15 phút!");
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

// =========================================================================
// CÀI ĐẶT WEBHOOK VÀ TRIGGER TỰ ĐỘNG QUÉT MAIL 1 PHÚT/LẦN
// =========================================================================
function setWebhook() {
  var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/setWebhook?url=" + SONIC_WEB_APP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log("Kết quả setWebhook Telegram: " + response.getContentText());
}

function setupSonicTelegramWebhook() {
  setWebhook();
}

function setupSonicTriggersAndWebhook() {
  setWebhook();

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

  Logger.log("✅ ĐÃ CÀI ĐẶT THÀNH CÔNG TELEGRAM WEBHOOK VÀ TRIGGER TỰ ĐỘNG QUÉT MAIL 1 PHÚT/LẦN!");
}

function handleMagimirDoGetOriginal(e) {
  var params = e ? e.parameter : {};
  var result = {};
  if (params && params.action === "check_payment_status") {
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
  } else {
    result = { status: "error", message: "Invalid action" };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function handleMagimirDoPostOriginal(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return; }
  if (data && data.message) {
    handleSonicTelegramMessage(data.message);
  }
}
