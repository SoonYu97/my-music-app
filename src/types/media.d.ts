export interface MediaFile {
  title: string;
  video_sources: string[];
  audio_sources: string[];
  image_poster?: string;
  original_lyrics?: string;
  translations: string[];
  has_lrc: boolean;
  artist?: string;
  album?: string;
}
