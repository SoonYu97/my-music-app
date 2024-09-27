interface AudioDisplayProps {
  audioSources: string[];
  onTimeUpdate: (event: React.SyntheticEvent<HTMLAudioElement>) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioDisplay: React.FC<AudioDisplayProps> = ({
  audioSources,
  onTimeUpdate,
  audioRef,
}) => {
  return (
    <div className="w-full md:w-1/2 mx-auto">
      <audio
        controls
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        className="w-full h-full object-cover"
      >
        {audioSources.map((src, index) => (
          <source key={index} src={src} />
        ))}
      </audio>
    </div>
  );
};

export default AudioDisplay;
