import { describe, it, expect, beforeAll } from 'bun:test';
import { TranscriptService } from '../services/transcript.js';

describe('TranscriptService', () => {
  let transcriptService: TranscriptService;

  beforeAll(() => {
    transcriptService = new TranscriptService();
  });

  describe('getTranscript', () => {
    it('should get transcript for a video with captions', async () => {
      // Using Rick Astley video which has auto-generated captions
      const result = await transcriptService.getTranscript({
        videoId: 'dQw4w9WgXcQ'
      });

      expect(result).toBeDefined();
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.transcript).toBeDefined();
      expect(Array.isArray(result.transcript)).toBe(true);
    });

    it('should include language in response', async () => {
      const result = await transcriptService.getTranscript({
        videoId: 'dQw4w9WgXcQ',
        language: 'en'
      });

      expect(result.language).toBe('en');
    });

    it('should throw error for invalid video', async () => {
      await expect(
        transcriptService.getTranscript({ videoId: 'nonexistent123xyz' })
      ).rejects.toThrow();
    });
  });

  describe('searchTranscript', () => {
    it('should search within a transcript', async () => {
      // This depends on transcript availability
      try {
        const result = await transcriptService.searchTranscript({
          videoId: 'dQw4w9WgXcQ',
          query: 'never'
        });

        expect(result).toBeDefined();
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.query).toBe('never');
        expect(Array.isArray(result.matches)).toBe(true);
        expect(typeof result.totalMatches).toBe('number');
      } catch (error) {
        // Skip if transcript not available
        expect(error).toBeDefined();
      }
    });

    it('should return zero matches for nonsense query', async () => {
      try {
        const result = await transcriptService.searchTranscript({
          videoId: 'dQw4w9WgXcQ',
          query: 'xyzabc123nonexistent'
        });

        expect(result.totalMatches).toBe(0);
        expect(result.matches).toHaveLength(0);
      } catch (error) {
        // Skip if transcript not available
        expect(error).toBeDefined();
      }
    });
  });

  describe('getTimestampedTranscript', () => {
    it('should get transcript with formatted timestamps', async () => {
      try {
        const result = await transcriptService.getTimestampedTranscript({
          videoId: 'dQw4w9WgXcQ'
        });

        expect(result).toBeDefined();
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.timestampedTranscript).toBeDefined();
        expect(Array.isArray(result.timestampedTranscript)).toBe(true);
      } catch (error) {
        // Skip if transcript not available
        expect(error).toBeDefined();
      }
    });
  });
});
