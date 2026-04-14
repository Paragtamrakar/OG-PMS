const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode');
const fs = require('fs');

// ✅ Config — Render pe Environment Variables se aayega
const CLIENT_NUMBER = process.env.CLIENT_NUMBER || '917223952680'; // dummy
const VERCEL_URL    = process.env.VERCEL_URL    || 'https://og-pms.vercel.app';

// ✅ WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
    }),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

let cronStarted = false;
let isSending   = false;

// 🔲 QR — image file mein save hogi
client.on('qr', async (qr) => {
    console.log('📱 QR Mila — qr.png file mein save ho rahi hai...');
    try {
        await qrcode.toFile('./qr.png', qr);
        console.log('✅ qr.png save ho gayi!');
        console.log('👉 Render dashboard se qr.png download karo aur scan karo');
    } catch (err) {
        console.error('❌ QR save error:', err.message);
    }
});

// ✅ WhatsApp Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Connected & Ready!');

    if (!cronStarted) {
        cronStarted = true;

        // 🔥 Pehli baar turant test
        sendDailyReport();

        // 🕙 Roz raat 10 baje (IST)
        cron.schedule('0 22 * * *', () => {
            console.log('🌙 Daily Report chal raha hai...');
            sendDailyReport();
        }, {
            timezone: 'Asia/Kolkata'
        });

        console.log('⏰ Scheduler ready — roz 10 PM report jayegi!');
    }
});

// ❌ Auth Failure
client.on('auth_failure', () => {
    console.log('❌ Auth Failed — QR dubara scan karo');
});

// ⚠️ Disconnected
client.on('disconnected', (reason) => {
    console.log('⚠️ Disconnected:', reason);
    // Auto reconnect
    setTimeout(() => {
        console.log('🔄 Reconnect ho raha hai...');
        client.initialize();
    }, 5000);
});

// ✅ Aaj ki sales Vercel se fetch karo
async function getTodaySales() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const url   = `${VERCEL_URL}/api/export?from=${today}&to=${today}`;

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

// ✅ Message Format
function formatDailyReport(data) {
    const fmt  = n => Number(n || 0).toLocaleString('en-IN');
    const date = new Date().toLocaleDateString('en-IN', {
        day:   '2-digit',
        month: 'long',
        year:  'numeric'
    });

    if (!data || (!data.totalRevenue && !data.roomRevenue && !data.foodRevenue)) {
        return `🏨 *OG PMS Daily Report*

📅 ${date}

━━━━━━━━━━━━━━
⚠️ Aaj koi sale record nahi hui

━━━━━━━━━━━━━━
_The OG Developers_`;
    }

    return `🏨 *OG PMS Daily Report*

📅 ${date}

━━━━━━━━━━━━━━

💰 *Total Revenue:* ₹${fmt(data.totalRevenue)}

🏨 Room Revenue:  ₹${fmt(data.roomRevenue)}
🍽️ Food Revenue:  ₹${fmt(data.foodRevenue)}
🧾 GST Collected: ₹${fmt(data.gstCollected)}

━━━━━━━━━━━━━━
_The OG Developers_`;
}

// ✅ Daily Report Send
async function sendDailyReport() {
    if (isSending) return;
    isSending = true;

    try {
        console.log('🚀 Report bhejna shuru...');

        const data    = await getTodaySales();
        const message = formatDailyReport(data);

        console.log('📝 Message:\n', message);

        await client.sendMessage(`${CLIENT_NUMBER}@c.us`, message);

        console.log('✅ Report bhej di!');

    } catch (err) {
        console.error('❌ Send Error:', err.message);
    }

    isSending = false;
}

// ✅ Check-in Message (future use)
async function sendCheckinMessage(guestPhone, guestName, roomNo, checkOut) {
    try {
        const message = `🏨 *Welcome to Our Hotel!*

👤 *Guest:* ${guestName}
🚪 *Room No:* ${roomNo}
📅 *Check-in:* ${new Date().toLocaleDateString('en-IN')}
📅 *Check-out:* ${checkOut}

Apna koi bhi sawaal poochh sakte hain!
Aapka swagat hai! 🙏`;

        await client.sendMessage(`91${guestPhone}@c.us`, message);
        console.log(`✅ Check-in message bheja: ${guestPhone}`);

    } catch (err) {
        console.error('❌ Check-in message error:', err.message);
    }
}

// ✅ Check-out Message (future use)
async function sendCheckoutMessage(guestPhone, guestName, totalAmount, nights) {
    try {
        const message = `🙏 *Thank You for Staying!*

👤 *Guest:* ${guestName}
🌙 *Nights:* ${nights}
💰 *Total Bill:* ₹${Number(totalAmount).toLocaleString('en-IN')}

Dubara padhaarein! ⭐
_The OG Developers_`;

        await client.sendMessage(`91${guestPhone}@c.us`, message);
        console.log(`✅ Check-out message bheja: ${guestPhone}`);

    } catch (err) {
        console.error('❌ Check-out message error:', err.message);
    }
}

// ✅ Functions export (future API use ke liye)
module.exports = { sendCheckinMessage, sendCheckoutMessage, sendDailyReport };

// 🚀 Start
console.log('🤖 OG PMS WhatsApp Bot start ho raha hai...');
client.initialize();