import type { LiveStream } from "@/types/live-stream";

function getDiscordWebhookUrl(): string {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url || url.trim().length === 0) {
    throw new Error("Missing DISCORD_WEBHOOK_URL environment variable.");
  }

  
  const webhook = new URL(url.trim());
  webhook.searchParams.set("with_components", "true");
  return webhook.toString();
}

function formatFooterTime(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const dayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const dayLabel = dayKey === todayKey ? "Today" : dayKey;
  return `${dayLabel} at ${time}`;
}

export async function sendLiveNotification(stream: LiveStream): Promise<void> {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(
    stream.videoId,
  )}`;
  const monitorUrl = "https://rage-live.vercel.app/";
  const footerTime = formatFooterTime(stream.startedAt);

  const payload = {
    content: `@everyone\n**${stream.streamerName}** is live on YouTube!`,
    allowed_mentions: {
      parse: ["everyone"],
    },
    username: "Rage Share Stream",
    avatar_url:
      "https://www.youtube.com/s/desktop/1a1db9c0/img/favicon_144x144.png",
    embeds: [
      {
        author: {
          name: stream.streamerName,
          url: watchUrl,
        },
        title: stream.title,
        url: watchUrl,
        color: 0xff0000,
        image: {
          url: stream.thumbnailUrl,
        },
        footer: {
          text: [
            footerTime,
            "\nKlik tombol di bawah untuk nonton stream, atau buka dashboard untuk lihat semua streamer RAGE yang sedang live.",
          ].join("\n"),
        },
      },
    ],
    components: [
      {
        type: 1, 
        components: [
          {
            type: 2, 
            style: 5, 
            label: "Watch Stream",
            url: watchUrl,
          },
          {
            type: 2,
            style: 5,
            label: "Open Dashboard",
            url: monitorUrl,
          },
        ],
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
