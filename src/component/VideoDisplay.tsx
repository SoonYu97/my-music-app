interface VideoDisplayProps {
  videoSources: string[];
  poster?: string;
  onTimeUpdate: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoSources,
  poster,
  onTimeUpdate,
  videoRef,
}) => {
  return (
    <div className="w-full md:w-1/2 mx-auto">
      <video
        controls
        poster={poster}
        ref={videoRef}
        onTimeUpdate={onTimeUpdate}
        className="w-full h-full object-cover"
      >
        {videoSources.map((src, index) => (
          <source key={index} src={src} />
        ))}
      </video>
    </div>
  );
};

export default VideoDisplay;
