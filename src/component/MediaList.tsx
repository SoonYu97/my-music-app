import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import MediaCard from "./MediaCard";

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

interface MediaListProps {
  onMediaSelect: (media: MediaFile) => void;
}

const MediaList: React.FC<MediaListProps> = ({ onMediaSelect }) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaFiles = async () => {
      try {
        const files: MediaFile[] = await invoke("list_media_files");
        setMediaFiles(files);
      } catch (err) {
        console.log(err);
        setError("Failed to load media files.");
      }
    };

    fetchMediaFiles();
  }, []);

  const handleClick = (file: MediaFile) => {
    onMediaSelect(file);
  };

  return (
    <aside className="p-4 w-1/3 md:w-1/4 lg:w-1/5">
      <h2 className="px-2 text-sm font-bold mb-4">Select a Media File</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="">
        {mediaFiles.map((mediaFile) => (
          <MediaCard
            key={mediaFile.title}
            handleClick={handleClick}
            mediaFile={mediaFile}
          />
        ))}
      </ul>
    </aside>
  );
};

export default MediaList;
