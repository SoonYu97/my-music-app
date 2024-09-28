import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import LyricDisplay from "./LyricDisplay";
import VideoDisplay from "./VideoDisplay";
import AudioDisplay from "./AudioDisplay";

interface VideoLyricsProps {
  title: string;
  videoSources: string[];
  audioSources: string[];
  poster?: string;
  original_lyrics?: string;
  translations?: string[];
  artist?: string;
  album?: string;
}

interface Lyric {
  time: number;
  text: string;
}

const VideoLyrics: React.FC<VideoLyricsProps> = ({
  title,
  videoSources,
  audioSources,
  poster,
  original_lyrics,
  translations,
  artist,
  album,
}) => {
  const [originalLyrics, setOriginalLyrics] = useState<Lyric[]>([]);
  const [translationLyrics, setTranslationLyrics] = useState<
    Record<string, Lyric[]>
  >({});
  const [translationToggles, setTranslationToggles] = useState<
    Record<string, boolean>
  >({});
  const [currentTime, setCurrentTime] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const parsedLyrics = await invoke<{ lyrics: Lyric[] }>(
          "parse_lyrics_file",
          { filePath: original_lyrics }
        );
        setOriginalLyrics(parsedLyrics.lyrics);
      } catch (error) {
        console.error("Error fetching original lyrics:", error);
      }
    };
    if (original_lyrics) fetchLyrics();
  }, [original_lyrics]);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (translations && translations.length > 0) {
        const translationData: Record<string, Lyric[]> = {};
        const translationState: Record<string, boolean> = {};

        for (const filePath of translations) {
          try {
            const language = filePath.split(".").slice(-2, -1)[0]; // Extract part before '.lrc'
            const parsedTranslation = await invoke<{
              lyrics: Lyric[];
            }>("parse_lyrics_file", { filePath });
            translationData[language!] = parsedTranslation.lyrics;
            translationState[language!] = false;
          } catch (error) {
            console.error(`Error fetching translation for ${filePath}:`, error);
          }
        }

        setTranslationLyrics(translationData);
        setTranslationToggles(translationState);
      }
    };

    fetchTranslations();
  }, [translations]);

  useEffect(() => {
    videoRef.current?.load();
  }, [videoSources]);

  useEffect(() => {
    audioRef.current?.load();
  }, [audioSources]);

  const handleTimeUpdate = (
    event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>
  ) => {
    const currentTime = event.currentTarget.currentTime;
    setCurrentTime(currentTime);
  };

  const handleLineClick = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  const toggleTranslation = (language: string) => {
    setTranslationToggles((prevState) => ({
      ...prevState,
      [language]: !prevState[language],
    }));
  };

  const activeTranslations = Object.keys(translationToggles).filter(
    (lang) => translationToggles[lang]
  );

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h2>{title}</h2>
        <h3>{artist}</h3>
        <h4>{album}</h4>
      </div>
      {videoSources?.length > 0 ? (
        <VideoDisplay
          videoSources={videoSources}
          onTimeUpdate={handleTimeUpdate}
          videoRef={videoRef}
          poster={poster}
        />
      ) : (
        audioSources?.length > 0 && (
          <AudioDisplay
            audioSources={audioSources}
            onTimeUpdate={handleTimeUpdate}
            audioRef={audioRef}
          />
        )
      )}

      <div className="flex gap-x-16">
        <button
          onClick={toggleAutoScroll}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {autoScroll ? "Disable Auto Scroll" : "Enable Auto Scroll"}
        </button>
        {Object.keys(translationToggles).map((language) => (
          <button
            key={language}
            onClick={() => toggleTranslation(language)}
            className={`mt-2 px-4 py-2 rounded ${
              translationToggles[language]
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {language}
          </button>
        ))}
      </div>

      <LyricDisplay
        lyrics={originalLyrics.map((lyric) => lyric.text)}
        translation={activeTranslations.map((lang) =>
          translationLyrics[lang]?.map((lyric) => lyric.text)
        )}
        timeStamps={originalLyrics.map((lyric) => lyric.time)}
        currentTime={currentTime}
        onLineClick={handleLineClick}
        autoScroll={autoScroll}
      />
    </div>
  );
};

export default VideoLyrics;
