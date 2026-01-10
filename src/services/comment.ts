import { google } from 'googleapis';
import { CommentParams } from '../types.js';

/**
 * Service for interacting with YouTube comments
 */
export class CommentService {
  private youtube;
  private initialized = false;

  constructor() {
    // Don't initialize in constructor
  }

  /**
   * Initialize the YouTube client only when needed
   */
  private initialize() {
    if (this.initialized) return;

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable is not set.');
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });

    this.initialized = true;
  }

  /**
   * Get comments for a YouTube video
   */
  async getComments({
    videoId,
    maxResults = 100,
    order = 'relevance',
    pageToken,
    textFormat = 'plainText'
  }: CommentParams): Promise<any> {
    try {
      this.initialize();

      const response = await this.youtube.commentThreads.list({
        part: ['snippet', 'replies'],
        videoId,
        maxResults,
        order,
        pageToken,
        textFormat
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get comments: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
