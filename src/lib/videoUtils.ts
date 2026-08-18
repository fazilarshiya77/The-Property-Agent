export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'html5';
  embedUrl: string;
  originalUrl: string;
  thumbnailUrl?: string;
}

/**
 * Extract YouTube Video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extract Vimeo Video ID from various Vimeo URL formats
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/;
  const match = url.match(regExp);
  return match ? match[1] || match[2] : null;
}

/**
 * Check if the URL is a direct video file or Supabase storage object
 */
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
  const isVideoExt = videoExtensions.some(ext => cleanUrl.endsWith(ext));
  const isSupabaseVideo = url.includes('/storage/v1/object/public/') && 
    (videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.includes('/videos/'));
  return isVideoExt || isSupabaseVideo;
}

/**
 * Parse any video URL and return unified embed metadata
 */
export function parseVideoUrl(url: string): VideoInfo {
  const trimmed = url.trim();

  // 1. YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`,
      originalUrl: trimmed,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  // 2. Vimeo
  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      originalUrl: trimmed,
    };
  }

  // 3. Direct HTML5 Video (e.g. Supabase Storage / MP4 / WebM)
  return {
    type: 'html5',
    embedUrl: trimmed,
    originalUrl: trimmed,
  };
}
