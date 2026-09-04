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
    content: `@everyone\n**${stream.streamerName}** is live on YouTube!\n${watchUrl}`,
    allowed_mentions: {
      parse: ["everyone"],
    },
    username: "Rage Share Stream",
    avatar_url: "https://www.youtube.com/s/desktop/1a1db9c0/img/favicon_144x144.png",
    embeds: [
      {
        author: {
          name: stream.streamerName,
          url: watchUrl,
        },
        title: stream.title,
        url: watchUrl,
        description: `[Watch Stream](${watchUrl})`,
        color: 0xff0000,
        image: {
          url: stream.thumbnailUrl,
        },
        footer: {
          text: "YouTube • RAGE LIVE MONITOR",
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
