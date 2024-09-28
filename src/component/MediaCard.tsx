import { MediaFile } from "./MediaList";

interface MediaCardProps {
  mediaFile: MediaFile;
  handleClick: (file: MediaFile) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ mediaFile, handleClick }) => {
  return (
    <div
      className="cursor-pointer max-w-xs rounded overflow-hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-600"
      onClick={() => handleClick(mediaFile)}
    >
      {mediaFile.image_poster && (
        <img
          className="w-full"
          src={mediaFile.image_poster}
          alt={mediaFile.title}
        />
      )}

      <div className="py-4">
        <div className="font-semibold text-md">{mediaFile.title}</div>
        <p className="text-xs text-slate-700 dark:text-slate-400">{mediaFile.artist}</p>
      </div>
    </div>
  );
};

export default MediaCard;
