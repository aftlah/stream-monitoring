import type { LiveStream } from "@/types/live-stream";

function getDiscordWebhookUrl(): string {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url || url.trim().length === 0) {
    throw new Error("Missing DISCORD_WEBHOOK_URL environment variable.");
  }
  return url.trim();
}

export async function sendLiveNotification(stream: LiveStream): Promise<void> {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(
    stream.videoId,
  )}`;

  const payload = {
    username: "RAGE LIVE MONITOR",
    embeds: [
      {
        title: `${stream.streamerName} is LIVE`,
        description: stream.title,
        url: watchUrl,
        color: 0xeab308,
        thumbnail: {
          url: stream.thumbnailUrl,
        },
        fields: [
          {
            name: "Streamer",
            value: stream.streamerName,
            inline: true,
          },
          {
            name: "Platform",
            value: "YouTube",
            inline: true,
          },
        ],
        footer: {
          text: "RAGE LIVE MONITOR",
        },
        timestamp: stream.startedAt ?? new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(getDiscordWebhookUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Discord webhook failed (${res.status}): ${body}`);
  }
}
