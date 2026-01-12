/**
 * Extracts YouTube video ID from various URL formats
 * Supports: 
 * - youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/embed/ID
 * - youtube.com/shorts/ID
 * - youtube.com/live/ID
 * - www.youtube.com/shorts/ID?...
 * - youtu.be/ID?...
 * - youtube.com/watch?v=ID&...
 * - youtube.com/live/ID?...
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Clean URL and trim
  const cleanUrl = url.trim();
  
  // Direct video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  
  // Patterns for various YouTube URL formats
  const patterns = [
    // youtube.com/shorts/ID or youtube.com/shorts/ID?...
    /(?:youtube\.com|www\.youtube\.com)\/shorts\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/watch?v=ID or youtube.com/watch?v=ID&...
    /(?:youtube\.com|www\.youtube\.com)\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // youtube.com/live/ID or youtube.com/live/ID?...
    /(?:youtube\.com|www\.youtube\.com)\/live\/([a-zA-Z0-9_-]{11})/,
    // youtu.be/ID or youtu.be/ID?...
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/ID
    /(?:youtube\.com|www\.youtube\.com)\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Returns YouTube thumbnail URL for a video ID
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'mq' | 'hq' | 'maxres' = 'mq'): string => {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};
