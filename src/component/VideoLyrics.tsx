import React, { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import VideoDisplay from "./VideoDisplay";
import LyricDisplay from "./LyricDisplay";

interface Lyric {
  time: number;
  text: string;
}

interface LyricsMetadata {
  artist: string;
  album: string;
  title: string;
  lyrics: Lyric[];
}

const VideoLyrics: React.FC<{ videoSrc: string; lyricsSrc: string }> = ({
  videoSrc,
  lyricsSrc,
}) => {
  const [metadata, setMetadata] = useState<LyricsMetadata | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(-1);
  const [isScrollPaused, setIsScrollPaused] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const parsedLyrics: LyricsMetadata = await invoke("parse_lyrics_file", {
          filePath: lyricsSrc,
        });
        setMetadata(parsedLyrics);
      } catch (error) {
        console.error("Error parsing lyrics:", error);
      }
    };

    fetchLyrics();
  }, [lyricsSrc]);

  useEffect(() => {
    videoRef.current?.load();
  }, [videoSrc, videoRef]);

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const currentTime = event.currentTarget.currentTime;
    if (metadata?.lyrics) {
      const index =
        metadata.lyrics.findIndex((lyric) => lyric.time > currentTime) - 1;
      setCurrentLyricIndex(index);
    }
  };

  const handleLyricClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleScrollPause = () => {
    setIsScrollPaused(true);
    if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
    scrollPauseTimerRef.current = setTimeout(() => {
      setIsScrollPaused(false);
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen mx-auto">
      {metadata && (
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold">{metadata.title}</h2>
          <h3 className="text-xl">{metadata.artist}</h3>
          <h4 className="text-lg">{metadata.album}</h4>
        </div>
      )}

      <VideoDisplay
        videoSrc={videoSrc}
        onTimeUpdate={handleTimeUpdate}
        videoRef={videoRef}
      />

      {metadata?.lyrics && (
        <LyricDisplay
          lyrics={metadata.lyrics}
          currentLyricIndex={currentLyricIndex}
          onLyricClick={handleLyricClick}
          onScrollPause={handleScrollPause}
          isScrollPaused={isScrollPaused}
        />
      )}
    </div>
  );
};

export default VideoLyrics;
