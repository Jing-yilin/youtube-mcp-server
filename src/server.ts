import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { encode } from '@toon-format/toon';
import * as fs from 'fs';
import * as path from 'path';
import { VideoService } from './services/video.js';
import { TranscriptService } from './services/transcript.js';
import { PlaylistService } from './services/playlist.js';
import { ChannelService } from './services/channel.js';
import { DataCleaners } from './cleaners.js';

function saveData(data: any, dir: string, toolName: string): string {
    try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filename = `${toolName}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return filepath;
    } catch (e) {
        return `Error saving: ${e}`;
    }
}

function formatResponse(cleanedData: any, options: { saveDir?: string; toolName?: string }) {
    const output = { data: cleanedData };
    let savedPath = '';
    if (options.saveDir && options.toolName) {
        savedPath = saveData(output, options.saveDir, options.toolName);
    }
    let text = encode(output);
    if (savedPath) text += `\n\n[Cleaned data saved to: ${savedPath}]`;
    return { content: [{ type: 'text' as const, text }] };
}

export async function startMcpServer() {
    const server = new McpServer({
        name: 'youtube-mcp-server',
        version: '1.2.0',
    });

    const videoService = new VideoService();
    const transcriptService = new TranscriptService();
    const playlistService = new PlaylistService();
    const channelService = new ChannelService();

    server.tool(
        'videos_getVideo',
        'Get video info. Returns cleaned data in TOON format.',
        {
            videoId: z.string().describe('The YouTube video ID'),
            parts: z.array(z.string()).optional().describe('Parts to retrieve'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ videoId, parts, save_dir }) => {
            const result = await videoService.getVideo({ videoId, parts });
            const cleaned = DataCleaners.cleanVideo(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'videos_getVideo' });
        }
    );

    server.tool(
        'videos_searchVideos',
        'Search videos. Returns cleaned data in TOON format.',
        {
            query: z.string().describe('Search query'),
            maxResults: z.number().optional().describe('Max results (default: 10)'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ query, maxResults, save_dir }) => {
            const result = await videoService.searchVideos({ query, maxResults });
            const cleaned = DataCleaners.cleanSearchResults(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'videos_searchVideos' });
        }
    );

    server.tool(
        'transcripts_getTranscript',
        'Get video transcript. Returns cleaned data in TOON format.',
        {
            videoId: z.string().describe('The YouTube video ID'),
            language: z.string().optional().describe('Language code'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ videoId, language, save_dir }) => {
            const result = await transcriptService.getTranscript({ videoId, language });
            const cleaned = DataCleaners.cleanTranscript(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'transcripts_getTranscript' });
        }
    );

    server.tool(
        'channels_getChannel',
        'Get channel info. Returns cleaned data in TOON format.',
        {
            channelId: z.string().describe('The YouTube channel ID'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ channelId, save_dir }) => {
            const result = await channelService.getChannel({ channelId });
            const cleaned = DataCleaners.cleanChannel(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'channels_getChannel' });
        }
    );

    server.tool(
        'channels_listVideos',
        'List channel videos. Returns cleaned data in TOON format.',
        {
            channelId: z.string().describe('The YouTube channel ID'),
            maxResults: z.number().optional().describe('Max results'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ channelId, maxResults, save_dir }) => {
            const result = await channelService.listVideos({ channelId, maxResults });
            const cleaned = DataCleaners.cleanSearchResults(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'channels_listVideos' });
        }
    );

    server.tool(
        'playlists_getPlaylist',
        'Get playlist info. Returns cleaned data in TOON format.',
        {
            playlistId: z.string().describe('The YouTube playlist ID'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ playlistId, save_dir }) => {
            const result = await playlistService.getPlaylist({ playlistId });
            const cleaned = DataCleaners.cleanPlaylist(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'playlists_getPlaylist' });
        }
    );

    server.tool(
        'playlists_getPlaylistItems',
        'Get playlist videos. Returns cleaned data in TOON format.',
        {
            playlistId: z.string().describe('The YouTube playlist ID'),
            maxResults: z.number().optional().describe('Max results'),
            save_dir: z.string().optional().describe('Directory to save cleaned JSON'),
        },
        async ({ playlistId, maxResults, save_dir }) => {
            const result = await playlistService.getPlaylistItems({ playlistId, maxResults });
            const cleaned = DataCleaners.cleanPlaylistItems(result);
            return formatResponse(cleaned, { ...(save_dir && { saveDir: save_dir }), toolName: 'playlists_getPlaylistItems' });
        }
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error(`YouTube MCP Server v1.2.0 started successfully`);
    console.error(`Server will validate YouTube API key when tools are called`);

    return server;
}
