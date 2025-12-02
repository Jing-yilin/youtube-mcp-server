import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { VideoService } from './services/video.js';
import { TranscriptService } from './services/transcript.js';
import { PlaylistService } from './services/playlist.js';
import { ChannelService } from './services/channel.js';

export async function startMcpServer() {
    const server = new McpServer({
        name: 'zubeid-youtube-mcp-server',
        version: '1.0.0',
    });

    const videoService = new VideoService();
    const transcriptService = new TranscriptService();
    const playlistService = new PlaylistService();
    const channelService = new ChannelService();

    // Register tools using the new McpServer API
    server.tool(
        'videos_getVideo',
        'Get detailed information about a YouTube video',
        {
            videoId: z.string().describe('The YouTube video ID'),
            parts: z.array(z.string()).optional().describe('Parts of the video to retrieve'),
        },
        async ({ videoId, parts }) => {
            const result = await videoService.getVideo({ videoId, parts });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    server.tool(
        'videos_searchVideos',
        'Search for videos on YouTube',
        {
            query: z.string().describe('Search query'),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async ({ query, maxResults }) => {
            const result = await videoService.searchVideos({ query, maxResults });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    server.tool(
        'transcripts_getTranscript',
        'Get the transcript of a YouTube video',
        {
            videoId: z.string().describe('The YouTube video ID'),
            language: z.string().optional().describe('Language code for the transcript'),
        },
        async ({ videoId, language }) => {
            const result = await transcriptService.getTranscript({ videoId, language });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    server.tool(
        'channels_getChannel',
        'Get information about a YouTube channel',
        {
            channelId: z.string().describe('The YouTube channel ID'),
        },
        async ({ channelId }) => {
            const result = await channelService.getChannel({ channelId });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    server.tool(
        'channels_listVideos',
        'Get videos from a specific channel',
        {
            channelId: z.string().describe('The YouTube channel ID'),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async ({ channelId, maxResults }) => {
            const result = await channelService.listVideos({ channelId, maxResults });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    server.tool(
        'playlists_getPlaylist',
        'Get information about a YouTube playlist',
        {
            playlistId: z.string().describe('The YouTube playlist ID'),
        },
        async ({ playlistId }) => {
            const result = await playlistService.getPlaylist({ playlistId });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    server.tool(
        'playlists_getPlaylistItems',
        'Get videos in a YouTube playlist',
        {
            playlistId: z.string().describe('The YouTube playlist ID'),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async ({ playlistId, maxResults }) => {
            const result = await playlistService.getPlaylistItems({ playlistId, maxResults });
            return {
                content: [{
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        }
    );

    // Create transport and connect
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error(`YouTube MCP Server v1.0.0 started successfully`);
    console.error(`Server will validate YouTube API key when tools are called`);

    return server;
}
