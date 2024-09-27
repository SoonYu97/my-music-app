import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface MediaFile {
  title: string;
  hasLrc: boolean;
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Select a Media File {mediaFiles.length}
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="list-disc pl-5">
        {mediaFiles.map(({ title, artist, album }, index) => (
          <li
            key={index}
            className="cursor-pointer hover:text-blue-500"
            onClick={() => handleClick({ title, hasLrc: true })} // Assuming hasLrc is true for all for now
          >
            {title} - {`${artist}${album && ` (${album})`}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MediaList;
