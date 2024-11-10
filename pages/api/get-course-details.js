import { google } from 'googleapis';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YT_API_KEY,
    });

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: id,
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = response.data.items[0];
    const videoDetails = {
      title: video.snippet.title,
      channelName: video.snippet.channelTitle,
      description: video.snippet.description,
      videoId: id,
      duration: parseDuration(video.contentDetails.duration),
    };

    return res.status(200).json(videoDetails);
  } catch (error) {
    console.error('Error fetching video info:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  return (hours ? parseInt(hours) * 3600 : 0) +
         (minutes ? parseInt(minutes) * 60 : 0) +
         (seconds ? parseInt(seconds) : 0);
}
