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
    <div className="flex flex-col items-center space-y-4 w-2/3 md:w-3/4 lg:w-5/5 h-screen py-2 dark:bg-neutral-900 bg-white text-slate-900 dark:text-white transition-colors duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <h3 className="text-lg">{artist}</h3>
        <h4 className="text-md">{album}</h4>
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

      <div className="flex gap-x-8 text-center">
        <div className="flex flex-col">
          <div className="text-sm">Auto Scroll</div>
          <button
            onClick={toggleAutoScroll}
            className={`mt-2 px-4 py-2 rounded shadow-md focus:outline-none transition-colors duration-300 ${
              autoScroll
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-500 text-white hover:bg-gray-600"
            }`}
          >
            {autoScroll ? "Disable" : "Enable"}
          </button>
        </div>
        <div className="flex flex-col">
          <div className="text-sm">Translation</div>
          <div className="flex flex-row gap-x-1">
            {Object.keys(translationToggles).map((language) => (
              <button
                key={language}
                onClick={() => toggleTranslation(language)}
                className={`mt-2 px-4 py-2 rounded shadow-md focus:outline-none transition-colors duration-300 ${
                  translationToggles[language]
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>
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
