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
    <div className="mx-auto h-1/3">
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
