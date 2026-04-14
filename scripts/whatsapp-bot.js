const cron = require('node-cron');

// ✅ Green API config (abhi hardcode)
const INSTANCE_ID = "7107587167";
const API_TOKEN = "d510569e10e34216a3b38a165e312e56efda7b45e2c345b38d";
const CLIENT_NUMBER = "917223952680";

const VERCEL_URL = "https://og-pms.vercel.app";

let isSending = false;

// ✅ Send WhatsApp via Green API
async function sendWhatsApp(message, phone = CLIENT_NUMBER) {
  const url = `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chatId: `${phone}@c.us`,
        message: message
      })
    });

    const data = await res.json();
    console.log("✅ Sent:", data);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// ✅ Aaj ki sales fetch
async function getTodaySales() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `${VERCEL_URL}/api/export?from=${today}&to=${today}`;

    console.log('🌐 Fetching:', url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const data = await res.json();
    console.log('📊 Data:', data);

    return data;

  } catch (err) {
    console.error('❌ Fetch Error:', err.message);
    return null;
  }
}

// ✅ Format message
function formatDailyReport(data) {
  const fmt = n => Number(n || 0).toLocaleString('en-IN');
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  if (!data || (!data.totalRevenue && !data.roomRevenue && !data.foodRevenue)) {
    return `🏨 OG PMS Daily Report

📅 ${date}

━━━━━━━━━━━━━━
⚠️ No sales recorded today
━━━━━━━━━━━━━━

_The OG Developers_`;
  }

  return `🏨 OG PMS Daily Report

📅 ${date}

━━━━━━━━━━━━━━

💰 Total Revenue: ₹${fmt(data.totalRevenue)}

🏨 Room: ₹${fmt(data.roomRevenue)}
🍽 Food: ₹${fmt(data.foodRevenue)}
🧾 GST: ₹${fmt(data.gstCollected)}

━━━━━━━━━━━━━━

_The OG Developers_`;
}

// ✅ Daily report send
async function sendDailyReport() {
  if (isSending) return;
  isSending = true;

  try {
    console.log('🚀 Sending report...');

    const data = await getTodaySales();
    const message = formatDailyReport(data);

    console.log('📝 Message:\n', message);

    await sendWhatsApp(message);

    console.log('✅ Report sent');

  } catch (err) {
    console.error('❌ Send Error:', err.message);
  }

  isSending = false;
}

// ✅ Check-in (future ready)
async function sendCheckinMessage(guestPhone, guestName, roomNo, checkOut) {
  const message = `🏨 Welcome!

👤 ${guestName}
🚪 Room: ${roomNo}
📅 Check-in: ${new Date().toLocaleDateString('en-IN')}
📅 Check-out: ${checkOut}

Enjoy your stay!`;

  await sendWhatsApp(message, `91${guestPhone}`);
}

// ✅ Check-out (future ready)
async function sendCheckoutMessage(guestPhone, guestName, totalAmount, nights) {
  const message = `🙏 Thank you for staying!

👤 ${guestName}
🌙 Nights: ${nights}
💰 Bill: ₹${Number(totalAmount).toLocaleString('en-IN')}

Visit again!`;

  await sendWhatsApp(message, `91${guestPhone}`);
}

// ✅ Start bot
console.log('🤖 OG PMS Green API Bot start ho raha hai...');

// 🔥 Test once
sendDailyReport();

// 🕙 Daily cron (10 PM IST)
// cron.schedule('0 22 * * *', () => {
//   console.log("🌙 Running daily report...");
//   sendDailyReport();
// }, {
//   timezone: "Asia/Kolkata"
// });
cron.schedule('* * * * *', () => {
  console.log("🌙 Running daily report...");
  sendDailyReport();
}, {
  timezone: "Asia/Kolkata"
});

// ✅ Export (future API use)
module.exports = {
  sendDailyReport,
  sendCheckinMessage,
  sendCheckoutMessage
};