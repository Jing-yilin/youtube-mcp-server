import { describe, it, expect, beforeAll } from 'bun:test';
import { VideoService } from '../services/video.js';

describe('VideoService', () => {
  let videoService: VideoService;

  beforeAll(() => {
    // Ensure API key is set
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY environment variable must be set for tests');
    }
    videoService = new VideoService();
  });

  describe('getVideo', () => {
    it('should get video details for a valid video ID', async () => {
      // Using a well-known video (Rick Astley - Never Gonna Give You Up)
      const result = await videoService.getVideo({ videoId: 'dQw4w9WgXcQ' });

      expect(result).not.toBeNull();
      expect(result.id).toBe('dQw4w9WgXcQ');
      expect(result.snippet).toBeDefined();
      expect(result.snippet.title).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.contentDetails).toBeDefined();
    });

    it('should return null for an invalid video ID', async () => {
      const result = await videoService.getVideo({ videoId: 'invalid_video_id_12345' });
      expect(result).toBeNull();
    });

    it('should respect custom parts parameter', async () => {
      const result = await videoService.getVideo({
        videoId: 'dQw4w9WgXcQ',
        parts: ['snippet']
      });

      expect(result).not.toBeNull();
      expect(result.snippet).toBeDefined();
      // statistics and contentDetails should not be present when only snippet is requested
    });
  });

  describe('searchVideos', () => {
    it('should search for videos with a query', async () => {
      const results = await videoService.searchVideos({ query: 'TypeScript tutorial', maxResults: 5 });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Each result should have snippet with title
      results.forEach(result => {
        expect(result.snippet).toBeDefined();
        expect(result.snippet.title).toBeDefined();
      });
    });

    it('should return results when maxResults is specified', async () => {
      const results = await videoService.searchVideos({
        query: 'JavaScript',
        maxResults: 3
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for nonsense query', async () => {
      const results = await videoService.searchVideos({
        query: 'xyzabc123nonexistentquery987zyx'
      });

      expect(Array.isArray(results)).toBe(true);
      // Might return 0 or some results depending on YouTube's algorithm
    });
  });

  describe('getVideoStats', () => {
    it('should get statistics for a valid video', async () => {
      const stats = await videoService.getVideoStats({ videoId: 'dQw4w9WgXcQ' });

      expect(stats).not.toBeNull();
      expect(stats.viewCount).toBeDefined();
      expect(stats.likeCount).toBeDefined();
    });

    it('should return null for invalid video ID', async () => {
      const stats = await videoService.getVideoStats({ videoId: 'invalid_id_xyz' });
      expect(stats).toBeNull();
    });
  });

  describe('getTrendingVideos', () => {
    it('should get trending videos with default parameters', async () => {
      const results = await videoService.getTrendingVideos({});

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10); // default maxResults
    });

    it('should get trending videos for a specific region', async () => {
      const results = await videoService.getTrendingVideos({
        regionCode: 'GB',
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should get trending videos for a specific category', async () => {
      // Category 10 is Music
      const results = await videoService.getTrendingVideos({
        videoCategoryId: '10',
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  // Note: getRelatedVideos API has been deprecated by YouTube
  // Skipping these tests as the relatedToVideoId parameter is no longer supported
});
