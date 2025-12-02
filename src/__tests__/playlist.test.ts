import { describe, it, expect, beforeAll } from 'bun:test';
import { PlaylistService } from '../services/playlist.js';

describe('PlaylistService', () => {
  let playlistService: PlaylistService;

  // Well-known playlist IDs for testing
  // YouTube Music Trending playlist (stable)
  const TEST_PLAYLIST = 'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj'; // Popular Music playlist

  beforeAll(() => {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY environment variable must be set for tests');
    }
    playlistService = new PlaylistService();
  });

  describe('getPlaylist', () => {
    it('should get playlist details for a valid playlist ID', async () => {
      const result = await playlistService.getPlaylist({
        playlistId: TEST_PLAYLIST
      });

      expect(result).not.toBeNull();
      expect(result.id).toBe(TEST_PLAYLIST);
      expect(result.snippet).toBeDefined();
      expect(result.snippet.title).toBeDefined();
      expect(result.contentDetails).toBeDefined();
    });

    it('should include item count in contentDetails', async () => {
      const result = await playlistService.getPlaylist({
        playlistId: TEST_PLAYLIST
      });

      expect(result).not.toBeNull();
      expect(result.contentDetails.itemCount).toBeDefined();
      expect(typeof result.contentDetails.itemCount).toBe('number');
    });

    it('should return null for invalid playlist ID', async () => {
      const result = await playlistService.getPlaylist({
        playlistId: 'invalid_playlist_xyz123'
      });

      expect(result).toBeNull();
    });
  });

  describe('getPlaylistItems', () => {
    it('should get items from a playlist', async () => {
      const results = await playlistService.getPlaylistItems({
        playlistId: TEST_PLAYLIST,
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);

      // Each item should have video info
      results.forEach(item => {
        expect(item.snippet).toBeDefined();
        expect(item.snippet.title).toBeDefined();
        expect(item.snippet.resourceId).toBeDefined();
        expect(item.snippet.resourceId.videoId).toBeDefined();
        expect(item.contentDetails).toBeDefined();
      });
    });

    it('should respect maxResults parameter', async () => {
      const results = await playlistService.getPlaylistItems({
        playlistId: TEST_PLAYLIST,
        maxResults: 3
      });

      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should include video position in playlist', async () => {
      const results = await playlistService.getPlaylistItems({
        playlistId: TEST_PLAYLIST,
        maxResults: 5
      });

      if (results.length > 0) {
        expect(results[0].snippet.position).toBeDefined();
        expect(typeof results[0].snippet.position).toBe('number');
        expect(results[0].snippet.position).toBe(0); // First item should be at position 0
      }
    });

    it('should use default maxResults of 50', async () => {
      const results = await playlistService.getPlaylistItems({
        playlistId: TEST_PLAYLIST
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(50);
    });
  });

  describe('searchPlaylists', () => {
    it('should search for playlists by query', async () => {
      const results = await playlistService.searchPlaylists({
        query: 'JavaScript tutorial',
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);

      // Each result should have snippet
      results.forEach(result => {
        expect(result.snippet).toBeDefined();
        expect(result.snippet.title).toBeDefined();
        expect(result.id.kind).toBe('youtube#playlist');
      });
    });

    it('should respect maxResults in search', async () => {
      const results = await playlistService.searchPlaylists({
        query: 'Python programming',
        maxResults: 3
      });

      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return results when searching', async () => {
      const results = await playlistService.searchPlaylists({
        query: 'coding',
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle queries with special characters', async () => {
      const results = await playlistService.searchPlaylists({
        query: 'C++ tutorials',
        maxResults: 5
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });
});
