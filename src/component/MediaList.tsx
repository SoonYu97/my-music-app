import { useState } from "react";
import MediaCard from "./MediaCard";
import SearchBar from "./SearchBar";
import useMediaFiles from "../hooks/useMediaFiles";
import { MediaFile } from "../types/media";

interface MediaListProps {
  onMediaSelect: (media: MediaFile) => void;
}

const MediaList: React.FC<MediaListProps> = ({ onMediaSelect }) => {
  const { mediaFiles, error } = useMediaFiles();
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const handleClick = (file: MediaFile) => {
    onMediaSelect(file);
  };

  const filteredMediaFiles = mediaFiles.filter(
    (mediaFile) =>
      mediaFile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mediaFile.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="p-4 w-1/3 md:w-1/4 lg:w-1/5 dark:bg-neutral-900 bg-white text-slate-900 dark:text-white transition-colors duration-300">
      <h2 className="px-2 text-sm font-bold mb-4">Select a Media File</h2>

      {/* Search Bar */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-4">
        {filteredMediaFiles.length > 0 ? (
          filteredMediaFiles.map((mediaFile) => (
            <MediaCard
              key={mediaFile.title}
              handleClick={handleClick}
              mediaFile={mediaFile}
            />
          ))
        ) : (
          <li className="text-gray-500 dark:text-gray-400">No media found</li>
        )}
      </ul>
    </aside>
  );
};

export default MediaList;
