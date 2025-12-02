# YouTube MCP Server

[![npm version](https://img.shields.io/npm/v/@yilin-jing/youtube-mcp-server.svg)](https://www.npmjs.com/package/@yilin-jing/youtube-mcp-server)

A Model Context Protocol (MCP) server implementation for YouTube, enabling AI language models to interact with YouTube content through a standardized interface. Updated to support MCP SDK 1.23.

## Features

### Video Information
* Get video details (title, description, duration, etc.)
* List channel videos
* Get video statistics (views, likes, comments)
* Search videos across YouTube

### Transcript Management
* Retrieve video transcripts
* Support for multiple languages
* Get timestamped captions
* Search within transcripts

### Channel Management
* Get channel details
* List channel playlists
* Get channel statistics
* Search within channel content

### Playlist Management
* List playlist items
* Get playlist details
* Search playlists

## Installation

### Quick Setup for Claude Desktop

1. Install the package:
```bash
npm install -g @yilin-jing/youtube-mcp-server
```

2. Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "youtube": {
      "command": "youtube-mcp-server",
      "env": {
        "YOUTUBE_API_KEY": "your_youtube_api_key_here"
      }
    }
  }
}
```

### Alternative: Using NPX (No Installation Required)

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "@yilin-jing/youtube-mcp-server"],
      "env": {
        "YOUTUBE_API_KEY": "your_youtube_api_key_here"
      }
    }
  }
}
```

## Configuration

Set the following environment variables:
* `YOUTUBE_API_KEY`: Your YouTube Data API key (required)
* `YOUTUBE_TRANSCRIPT_LANG`: Default language for transcripts (optional, defaults to 'en')

## YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create API credentials (API key)
5. Copy the API key for configuration

## Available Tools

| Tool | Description |
|------|-------------|
| `videos_getVideo` | Get detailed information about a YouTube video |
| `videos_searchVideos` | Search for videos on YouTube |
| `transcripts_getTranscript` | Get the transcript of a YouTube video |
| `channels_getChannel` | Get information about a YouTube channel |
| `channels_listVideos` | Get videos from a specific channel |
| `playlists_getPlaylist` | Get information about a YouTube playlist |
| `playlists_getPlaylistItems` | Get videos in a YouTube playlist |

## Examples

### Managing Videos

```javascript
// Get video details
const video = await youtube.videos_getVideo({
  videoId: "dQw4w9WgXcQ"
});

// Search videos
const searchResults = await youtube.videos_searchVideos({
  query: "TypeScript tutorial",
  maxResults: 10
});
```

### Managing Transcripts

```javascript
// Get video transcript
const transcript = await youtube.transcripts_getTranscript({
  videoId: "dQw4w9WgXcQ",
  language: "en"
});
```

### Managing Channels

```javascript
// Get channel details
const channel = await youtube.channels_getChannel({
  channelId: "UC_x5XG1OV2P6uZZ5FSM9Ttw"
});

// List channel videos
const videos = await youtube.channels_listVideos({
  channelId: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  maxResults: 50
});
```

### Managing Playlists

```javascript
// Get playlist items
const playlistItems = await youtube.playlists_getPlaylistItems({
  playlistId: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
  maxResults: 50
});

// Get playlist details
const playlist = await youtube.playlists_getPlaylist({
  playlistId: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
});
```

## Development

```bash
# Install dependencies
npm install
# or
bun install

# Build
npm run build

# Run tests
bun test

# Start server
npm start
```

## Testing

This project includes 50 comprehensive tests covering all services:

```bash
# Run tests with bun
YOUTUBE_API_KEY="your_api_key" bun test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Originally forked from [ZubeidHendricks/youtube-mcp-server](https://github.com/ZubeidHendricks/youtube-mcp-server), updated with MCP SDK 1.23 support and comprehensive test coverage.
