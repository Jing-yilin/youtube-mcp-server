// Data cleaners for YouTube entities - removes redundant data for token efficiency

export const DataCleaners = {
  cleanVideo: (video: any): any => {
    if (!video) return null;
    const snippet = video.snippet || {};
    const stats = video.statistics || {};
    const content = video.contentDetails || {};
    return {
      id: video.id,
      title: snippet.title,
      channel: snippet.channelTitle,
      channelId: snippet.channelId,
      published: snippet.publishedAt,
      description: snippet.description?.substring(0, 300),
      duration: content.duration,
      views: stats.viewCount ? parseInt(stats.viewCount) : undefined,
      likes: stats.likeCount ? parseInt(stats.likeCount) : undefined,
      comments: stats.commentCount ? parseInt(stats.commentCount) : undefined,
      tags: snippet.tags?.slice(0, 5),
    };
  },

  cleanSearchResult: (item: any): any => {
    if (!item) return null;
    const snippet = item.snippet || {};
    return {
      id: item.id?.videoId || item.id,
      title: snippet.title,
      channel: snippet.channelTitle,
      channelId: snippet.channelId,
      published: snippet.publishedAt,
      description: snippet.description?.substring(0, 200),
    };
  },

  cleanChannel: (channel: any): any => {
    if (!channel) return null;
    const snippet = channel.snippet || {};
    const stats = channel.statistics || {};
    return {
      id: channel.id,
      title: snippet.title,
      description: snippet.description?.substring(0, 300),
      customUrl: snippet.customUrl,
      published: snippet.publishedAt,
      country: snippet.country,
      subscribers: stats.subscriberCount ? parseInt(stats.subscriberCount) : undefined,
      videos: stats.videoCount ? parseInt(stats.videoCount) : undefined,
      views: stats.viewCount ? parseInt(stats.viewCount) : undefined,
    };
  },

  cleanPlaylist: (playlist: any): any => {
    if (!playlist) return null;
    const snippet = playlist.snippet || {};
    const content = playlist.contentDetails || {};
    return {
      id: playlist.id,
      title: snippet.title,
      channel: snippet.channelTitle,
      channelId: snippet.channelId,
      description: snippet.description?.substring(0, 200),
      published: snippet.publishedAt,
      itemCount: content.itemCount,
    };
  },

  cleanPlaylistItem: (item: any): any => {
    if (!item) return null;
    const snippet = item.snippet || {};
    return {
      id: snippet.resourceId?.videoId,
      title: snippet.title,
      channel: snippet.videoOwnerChannelTitle,
      position: snippet.position,
      published: snippet.publishedAt,
    };
  },

  cleanTranscript: (result: any): any => {
    if (!result) return null;
    const segments = result.transcript || result;
    if (!Array.isArray(segments)) return { videoId: result.videoId, segments: [] };
    return {
      videoId: result.videoId,
      language: result.language,
      segments: segments.map(s => ({
        text: s.text,
        start: s.offset ?? s.start,
        duration: s.duration,
      })),
    };
  },

  cleanVideoList: (videos: any[]): any[] => {
    if (!Array.isArray(videos)) return [];
    return videos.map(DataCleaners.cleanVideo).filter(Boolean);
  },

  cleanSearchResults: (items: any[]): any[] => {
    if (!Array.isArray(items)) return [];
    return items.map(DataCleaners.cleanSearchResult).filter(Boolean);
  },

  cleanPlaylistItems: (items: any[]): any[] => {
    if (!Array.isArray(items)) return [];
    return items.map(DataCleaners.cleanPlaylistItem).filter(Boolean);
  },
};
