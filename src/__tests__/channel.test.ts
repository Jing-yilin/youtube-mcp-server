import { describe, it, expect, beforeAll } from 'bun:test';
import { ChannelService } from '../services/channel.js';

describe('ChannelService', () => {
  let channelService: ChannelService;

  // Well-known channel IDs for testing
  const GOOGLE_DEVELOPERS_CHANNEL_ID = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Google Developers
  const TED_CHANNEL_ID = 'UCAuUUnT6oDeKwE6v1NGQxug'; // TED

  beforeAll(() => {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY environment variable must be set for tests');
    }
    channelService = new ChannelService();
  });

  describe('getChannel', () => {
    it('should get channel details for a valid channel ID', async () => {
      const result = await channelService.getChannel({
        channelId: GOOGLE_DEVELOPERS_CHANNEL_ID
      });

      expect(result).not.toBeNull();
      expect(result.id).toBe(GOOGLE_DEVELOPERS_CHANNEL_ID);
      expect(result.snippet).toBeDefined();
      expect(result.snippet.title).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.contentDetails).toBeDefined();
    });

    it('should return null for invalid channel ID', async () => {
      const result = await channelService.getChannel({
        channelId: 'invalid_channel_id_xyz123'
      });

      expect(result).toBeNull();
    });

    it('should include subscriber count in statistics', async () => {
      const result = await channelService.getChannel({
        channelId: TED_CHANNEL_ID
      });

      expect(result).not.toBeNull();
      expect(result.statistics.subscriberCount).toBeDefined();
      expect(result.statistics.viewCount).toBeDefined();
      expect(result.statistics.videoCount).toBeDefined();
    });
  });

  describe('getPlaylists', () => {
    it('should get playlists for a channel', async () => {
      const results = await channelService.getPlaylists({
        channelId: TED_CHANNEL_ID,
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
      // TED should have playlists
      if (results.length > 0) {
        expect(results[0].snippet).toBeDefined();
        expect(results[0].snippet.title).toBeDefined();
        expect(results[0].contentDetails).toBeDefined();
      }
    });

    it('should respect maxResults parameter', async () => {
      const results = await channelService.getPlaylists({
        channelId: TED_CHANNEL_ID,
        maxResults: 3
      });

      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should handle channel with few playlists', async () => {
      // Test structure with a valid channel
      const results = await channelService.getPlaylists({
        channelId: GOOGLE_DEVELOPERS_CHANNEL_ID,
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('listVideos', () => {
    it('should list videos from a channel', async () => {
      const results = await channelService.listVideos({
        channelId: GOOGLE_DEVELOPERS_CHANNEL_ID,
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);

      // Each video should have snippet
      results.forEach(video => {
        expect(video.snippet).toBeDefined();
        expect(video.snippet.title).toBeDefined();
        expect(video.snippet.channelId).toBe(GOOGLE_DEVELOPERS_CHANNEL_ID);
      });
    });

    it('should return videos array', async () => {
      const results = await channelService.listVideos({
        channelId: GOOGLE_DEVELOPERS_CHANNEL_ID,
        maxResults: 10
      });

      // Videos should be returned as array
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Each result should have publishedAt
      results.forEach(video => {
        expect(video.snippet.publishedAt).toBeDefined();
      });
    });

    it('should use default maxResults of 50 when not specified', async () => {
      const results = await channelService.listVideos({
        channelId: TED_CHANNEL_ID
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(50);
    });
  });

  describe('getStatistics', () => {
    it('should get channel statistics', async () => {
      const stats = await channelService.getStatistics({
        channelId: TED_CHANNEL_ID
      });

      expect(stats).not.toBeNull();
      expect(stats.viewCount).toBeDefined();
      expect(stats.subscriberCount).toBeDefined();
      expect(stats.videoCount).toBeDefined();

      // These should be numeric strings
      expect(parseInt(stats.viewCount)).toBeGreaterThan(0);
      expect(parseInt(stats.subscriberCount)).toBeGreaterThan(0);
      expect(parseInt(stats.videoCount)).toBeGreaterThan(0);
    });

    it('should return null for invalid channel', async () => {
      const stats = await channelService.getStatistics({
        channelId: 'invalid_channel_xyz'
      });

      expect(stats).toBeNull();
    });
  });
});
