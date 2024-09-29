import { useState, useEffect } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { MediaFile } from "../types/media";

const useMediaFiles = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaFiles = async () => {
      try {
        const files: MediaFile[] = await invoke("list_media_files");
        const updatedFiles = files.map((file) => ({
          ...file,
          video_sources: file.video_sources.map((source: string) => convertFileSrc(source)),
          audio_sources: file.audio_sources.map((source: string) => convertFileSrc(source)),
          image_poster: file.image_poster ? convertFileSrc(file.image_poster) : undefined,
        }));
        setMediaFiles(updatedFiles);
      } catch (err) {
        setError("Failed to load media files.");
      }
    };

    fetchMediaFiles();
  }, []);

  return { mediaFiles, error };
};

export default useMediaFiles;
