const cron = require('node-cron');

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// // ✅ Daily report send
// async function sendDailyReport() {
//   if (isSending) return;
//   isSending = true;

//   try {
//     console.log('🚀 Sending report...');

//     const data = await getTodaySales();
//     const message = formatDailyReport(data);

//     console.log('📝 Message:\n', message);

//     await sendWhatsApp(message);

//     console.log('✅ Report sent');

//   } catch (err) {
//     console.error('❌ Send Error:', err.message);
//   }

//   isSending = false;
// }

// ✅ Check-in (future ready)
async function sendCheckinMessage(guestPhone, guestName, roomNo, checkOut) {
  
  const checkInDate = formatDate(new Date());
  const checkOutDate = formatDate(checkOut);



   const payload = {
    to: `91${guestPhone}`,
    templateName: "ogpms_checkin_confirmation_v1",
    params: [
      guestName,
      "Amar vilas",
      checkInDate,
      checkOutDate,
      String(roomNo)
    ]
  };


  const result = await sendWhatsAppTemplate(payload);



  return result;
}

// ✅ Check-out (future ready)
async function sendCheckoutMessage(guestPhone, guestName, totalAmount, nights) {
  
  const message = `🙏 Thank you for staying!

👤 ${guestName}
🌙 Nights: ${nights}
💰 Bill: ₹${Number(totalAmount).toLocaleString('en-IN')}

Visit again!`;

  return await sendWhatsAppTemplate({
    to: `91${guestPhone}`,
    templateName: "ogpms_checkout_confirmation_v1_",
    params: [
      guestName,
      "Amar vilas",
      "Visit again soon",
      totalAmount
    ]
  });
}





// 🕙 Daily cron (10 PM IST)
cron.schedule('9 23 * * *', () => {

  sendDailyReport();
}, {
  timezone: "Asia/Kolkata"
});
async function sendWhatsAppTemplate({ to, templateName, params = [] }) {
  const url = `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" } // ✅ FIXED
    }
  };

  if (params.length > 0) {
    body.template.components = [
      {
        type: "body",
        parameters: params.map(p => ({
          type: "text",
          text: p
        }))
      }
    ];
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ WhatsApp Error:", data);
     console.dir(data, { depth: null });
    throw new Error(JSON.stringify(data));
  }

  return data;
}

// ✅ Export (future API use)
module.exports = {
  // sendDailyReport,
  sendCheckinMessage,
  sendCheckoutMessage
};
