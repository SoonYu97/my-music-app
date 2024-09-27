interface VideoDisplayProps {
  videoSrc: string;
  onTimeUpdate: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>; // Accept videoRef as a prop
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoSrc,
  onTimeUpdate,
  videoRef,
}) => {
  return (
    <div className="w-full md:w-1/2 mx-auto">
      <video
        controls
        ref={videoRef}
        onTimeUpdate={onTimeUpdate}
        className="w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/webm" />
      </video>
    </div>
  );
};

export default VideoDisplay;
