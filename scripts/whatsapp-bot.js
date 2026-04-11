const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

// ✅ WhatsApp Client (session save)
const client = new Client({
    authStrategy: new LocalAuth()
});

let cronStarted = false;
let isSending = false;

// 🔲 QR
client.on('qr', qr => {
    console.log("📱 Scan this QR 👇");
    qrcode.generate(qr, { small: true });
});

// ✅ READY (MAIN ENTRY POINT)
client.on('ready', () => {
    console.log('✅ WhatsApp Ready');

    if (!cronStarted) {
        cronStarted = true;

        // 🔥 Instant test (1 baar)
        sendReport();

        // 🔁 TEST MODE (har 1 min)
        cron.schedule('* * * * *', () => {
            console.log("⏱ Running Test Report...");
            sendReport();
        });

        // 🟢 PRODUCTION MODE (baad me enable karna)
        /*
        cron.schedule('0 22 * * *', () => {
          console.log("🌙 Running Daily Report (10 PM)...");
          sendReport();
        });
        */
    }
});

// ❌ Error handling
client.on('auth_failure', () => {
    console.log("❌ Auth Failed - QR dubara scan karo");
});

client.on('disconnected', () => {
    console.log("⚠️ WhatsApp Disconnected");
});

// ✅ API fetch
async function getTodaySales() {
    try {
        const today = new Date().toISOString().split("T")[0];
        const url = `http://localhost:3000/api/reports?from=${today}&to=${today}`;

        console.log("🌐 Fetching:", url);

        const res = await fetch(url);

        if (!res.ok) {
            const text = await res.text();
            console.log("❌ Raw Response:", text);
            throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();

        console.log("📊 Data:", data);

        return data;

    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        return null;
    }
}

// ✅ Message format
function formatMessage(data) {
  try {
    if (!data || data.totalRevenue === 0) {
      return `🏨 *OG PMS Daily Report*

📅 ${new Date().toLocaleDateString('en-IN')}

━━━━━━━━━━━━━━
⚠️ No sales recorded today

━━━━━━━━━━━━━━
_OG Developers_`;
    }

    const fmt = n => Number(n).toLocaleString('en-IN');

    const total = data.totalRevenue;
    const room = data.roomRevenue;
    const food = data.foodRevenue;
    const gst  = data.gstCollected;

    return `🏨 *OG PMS Daily Report*

📅 ${new Date().toLocaleDateString('en-IN')}

━━━━━━━━━━━━━━

💰 *Total Revenue:* ₹${fmt(total)}

🏨 Room: ₹${fmt(room)}  
🍽 Food: ₹${fmt(food)}  
🧾 GST: ₹${fmt(gst)}

━━━━━━━━━━━━━━
_The OG Developers_`;

  } catch (err) {
    console.error("❌ Format Error:", err.message);
    return "⚠️ Error generating report";
  }
}
// ✅ Send message (safe)
async function sendReport() {
    if (isSending) return;
    isSending = true;

    try {
        console.log("🚀 Sending report...");

        const data = await getTodaySales();
        const message = formatMessage(data);

        const number = '917223952680@c.us'; // 👈 apna number

        console.log("📨 Sending to:", number);
        console.log("📝 Message:\n", message);

        await client.sendMessage(number, message);

        console.log("✅ Report Sent");

    } catch (err) {
        console.error("❌ Send Error:", err.message);
    }

    isSending = false;
}

// 🚀 Start
client.initialize();