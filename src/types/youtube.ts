export type YoutubeThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

export type YoutubeSearchItem = {
  id: {
    kind: string;
    videoId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    channelTitle: string;
    thumbnails: {
      default?: YoutubeThumbnail;
      medium?: YoutubeThumbnail;
      high?: YoutubeThumbnail;
      standard?: YoutubeThumbnail;
      maxres?: YoutubeThumbnail;
    };
  };
};

export type YoutubeSearchResponse = {
  items: YoutubeSearchItem[];
};

export type YoutubeVideoItem = {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    channelTitle: string;
    thumbnails: {
      default?: YoutubeThumbnail;
      medium?: YoutubeThumbnail;
      high?: YoutubeThumbnail;
      standard?: YoutubeThumbnail;
      maxres?: YoutubeThumbnail;
    };
  };
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
  };
};

export type YoutubeVideosResponse = {
  items: YoutubeVideoItem[];
};
