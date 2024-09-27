import { useState } from "react";
import "./App.css";
import MediaList from "./component/MediaList";
import VideoLyrics from "./component/VideoLyrics";

interface MediaFile {
  title: string;
  video_sources: string[];
  audio_sources: string[];
  image_poster: string | null;
  has_lrc: boolean;
}

function App() {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  const handleMediaSelect = (media: MediaFile) => {
    setSelectedMedia(media);
    
    console.log(media.image_poster)
  };

  return (
    <div className="container mx-auto">
      <MediaList onMediaSelect={handleMediaSelect} />
      {selectedMedia && (
        <VideoLyrics
          videoSources={selectedMedia.video_sources}
          audioSources={selectedMedia.audio_sources}
          poster={selectedMedia.image_poster}
          lyricsSrc={
            selectedMedia.has_lrc
              ? `../public/media/${selectedMedia?.title}/${selectedMedia?.title}.lrc`
              : ""
          }
        />
      )}
    </div>
  );
}

export default App;
