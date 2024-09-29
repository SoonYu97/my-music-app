import { useState, useEffect, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import LyricDisplay from "./LyricDisplay";
import VideoDisplay from "./VideoDisplay";
import AudioDisplay from "./AudioDisplay";
import ToggleButton from "./ToggleButton";
import ScrollControl from "./ScrollControl";

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
  translations = [],
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
      } else {
        setTranslationLyrics({});
        setTranslationToggles({});
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

  const toggleTranslation = (language: string) => {
    setTranslationToggles((prevState) => ({
      ...prevState,
      [language]: !prevState[language],
    }));
  };

  const activeTranslations = useMemo(() => {
    return Object.keys(translationToggles).filter(
      (lang) => translationToggles[lang]
    );
  }, [translationToggles]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full h-screen py-2 dark:bg-neutral-900 dark:text-white">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold">{title}</h2>
        {artist && (
          <h3 className="text-sm font-semibold text-gray-400">{artist}</h3>
        )}
        {album && <h4 className="text-xs text-gray-500">{album}</h4>}
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
        {/* Auto Scroll */}
        <ScrollControl
          autoScroll={autoScroll}
          toggleAutoScroll={() => setAutoScroll(!autoScroll)}
        />

        <div className="flex flex-col">
          <div>Translation</div>
          {Object.keys(translationToggles).length > 0 ? (
            <div className="flex mt-2 flex-row gap-2">
              {Object.keys(translationToggles).map((language) => (
                <ToggleButton
                  key={language}
                  isActive={translationToggles[language]}
                  onClick={() => toggleTranslation(language)}
                  label={language}
                />
              ))}
            </div>
          ) : (
            <div className="mt-2 px-4 py-2 rounded shadow-md focus:outline-none">
              No Translation
            </div>
          )}
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
