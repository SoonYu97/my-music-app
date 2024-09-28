import { useState } from "react";
import "./App.css";
import MediaList, { MediaFile } from "./component/MediaList";
import VideoLyrics from "./component/VideoLyrics";

function App() {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  const handleMediaSelect = (media: MediaFile) => {
    setSelectedMedia(media);
  };

  return (
    <div className="container mx-auto flex min-w-full min-h-screen dark:bg-neutral-900 text-slate-900 dark:text-white">
      <MediaList onMediaSelect={handleMediaSelect} />
      {selectedMedia && (
        <VideoLyrics
          title={selectedMedia.title}
          videoSources={selectedMedia.video_sources}
          audioSources={selectedMedia.audio_sources}
          poster={selectedMedia.image_poster}
          original_lyrics={selectedMedia.original_lyrics}
          translations={selectedMedia.translations}
          artist={selectedMedia.artist}
          album={selectedMedia.album}
        />
      )}
    </div>
  );
}

export default App;
