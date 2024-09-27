import { useEffect, useRef } from "react";

interface Lyric {
  time: number;
  text: string;
}

interface LyricDisplayProps {
  lyrics: Lyric[];
  currentLyricIndex: number;
  isScrollPaused: boolean;
  onLyricClick: (time: number) => void;
  onScrollPause: () => void;
}

const LyricDisplay: React.FC<LyricDisplayProps> = ({
  lyrics,
  currentLyricIndex,
  isScrollPaused,
  onLyricClick,
  onScrollPause,
}) => {
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const currentLyricElement = document.getElementById(
      `lyric-${currentLyricIndex}`
    );
    if (!isScrollPaused && currentLyricElement && lyricsContainerRef.current) {
      currentLyricElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLyricIndex]);
  return (
    <div
      ref={lyricsContainerRef}
      onScroll={onScrollPause}
      className="w-full mx-auto md:w-1/2 overflow-y-scroll p-4 bg-gray-100 h-128"
    >
      {lyrics.map((lyric, index) => (
        <p
          key={index}
          id={`lyric-${index}`}
          className={`py-2 cursor-pointer ${
            currentLyricIndex === index
              ? "text-red-500 font-bold"
              : "text-black"
          }`}
          onClick={() => onLyricClick(lyric.time)} // Trigger click handler
        >
          <span dangerouslySetInnerHTML={{ __html: lyric.text }} />
        </p>
      ))}
    </div>
  );
};

export default LyricDisplay;
