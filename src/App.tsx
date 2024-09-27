import { useState } from "react";
import "./App.css";
import MediaList from "./component/MediaList";
import VideoLyrics from "./component/VideoLyrics";

function App() {
  const [selectedMedia, setSelectedMedia] = useState<{
    title: string;
    hasLrc: boolean;
  } | null>(null);

  const handleMediaSelect = (media: { title: string; hasLrc: boolean }) => {
    setSelectedMedia(media);
  };

  return (
    <div className="container mx-auto">
      <MediaList onMediaSelect={handleMediaSelect} />
      {selectedMedia && (
        <VideoLyrics
          videoSrc={`../public/media/${selectedMedia?.title}`}
          lyricsSrc={
            selectedMedia?.hasLrc
              ? `../public/media/${selectedMedia?.title.replace(
                  /\.[^/.]+$/,
                  ".lrc"
                )}`
              : ""
          }
        />
      )}
    </div>
  );
}

export default App;
