import { registerAs } from '@nestjs/config';

function parseTopicId(value: string | undefined): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = parseInt(value.trim(), 10);
  return Number.isNaN(n) ? undefined : n;
}

export default registerAs('telegram', () => {
  const topicOtp =
    parseTopicId(process.env.TELEGRAM_TOPIC_ID_OTP) ??
    parseTopicId(process.env.TELEGRAM_TOPIC_ID);
  const topicModeration = parseTopicId(
    process.env.TELEGRAM_TOPIC_ID_MODERATION,
  );

  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    topicIdOtp: topicOtp,
    topicIdModeration: topicModeration,
    enabled: Boolean(
      process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
    ),
  };
});
