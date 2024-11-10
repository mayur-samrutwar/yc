import { google } from 'googleapis';

export default async function handler(req, res) {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YT_API_KEY,
    });

    const response = await youtube.videos.list({
      part: 'snippet',
      id: videoId,
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const channelName = response.data.items[0].snippet.channelTitle;
    return res.status(200).json({ channelName });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
