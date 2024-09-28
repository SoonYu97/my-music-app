import { useEffect, useRef, useState } from "react";

interface LyricDisplayProps {
  lyrics: string[];
  translation?: string[][];
  timeStamps: number[];
  currentTime: number;
  onLineClick: (time: number) => void;
  autoScroll: boolean;
}

const LyricDisplay: React.FC<LyricDisplayProps> = ({
  lyrics,
  translation = [],
  timeStamps,
  currentTime,
  onLineClick,
  autoScroll,
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  const currentLyricIndex = timeStamps.findIndex((time, index) => {
    return (
      currentTime >= time &&
      (index === timeStamps.length - 1 || currentTime < timeStamps[index + 1])
    );
  });

  useEffect(() => {
    if (autoScroll && !isScrolling && lyricsRef.current) {
      const currentLyricElement = lyricsRef.current.children[currentLyricIndex];
      if (currentLyricElement) {
        currentLyricElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      // const activeIndex = timeStamps.findIndex((stamp) => currentTime < stamp);
      // if (activeIndex !== -1 && lyricsRef.current) {
      //   const activeElement = lyricsRef.current.children[activeIndex];
      //   activeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      // }
    }
  }, [currentTime, autoScroll, isScrolling, timeStamps]);

  const handleScroll = () => {
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 2000);
  };

  return (
    <div
      ref={lyricsRef}
      onScroll={handleScroll}
      className="overflow-y-auto h-full w-full text-slate-900 dark:text-white p-4 rounded"
    >
      {lyrics.map((line, index) => (
        <div
          key={index}
          onClick={() => onLineClick(timeStamps[index])}
          className={`lyric-line py-2 ${
            currentLyricIndex === index
              ? "text-yellow-700 dark:text-yellow-300 font-bold"
              : "text-slate-800 dark:text-white"
          } cursor-pointer`}
        >
          <span dangerouslySetInnerHTML={{ __html: line }} />
          {translation.map((trans, transIndex) => (
            <div
              key={transIndex}
              className={`text-sm ${
                currentLyricIndex === index
                  ? "text-red-700 dark:text-red-300 font-semibold"
                  : "text-slate-800 dark:text-white"
              }`}
            >
              {trans[index]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LyricDisplay;
