/**
 * Telegram Bot Configuration
 * Generate a token via BotFather on Telegram.
 * Get your chat ID via userinfobot or by messaging your bot and checking the getUpdates API.
 */

export const TELEGRAM_CONFIG = {
  BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  CHAT_ID: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
};

export const sendTelegramNotification = async (bookingDetails: {
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  timeSlot: string;
}) => {
  if (!TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID) {
    console.warn("Telegram configuration missing. Notification bypassed.");
    return;
  }

  const text = `
💈 *NEW BOOKING | QLF Barber Shop* 💈

👤 *Customer:* ${bookingDetails.firstName} ${bookingDetails.lastName}
📞 *Phone:* ${bookingDetails.phone}
📅 *Date:* ${bookingDetails.date}
⏰ *Time:* ${bookingDetails.timeSlot}

_Please check the admin dashboard for details._
`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
};