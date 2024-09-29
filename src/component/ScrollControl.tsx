import { MouseOff, Mouse } from "lucide-react";

const ScrollControl: React.FC<{
  autoScroll: boolean;
  toggleAutoScroll: () => void;
}> = ({ autoScroll, toggleAutoScroll }) => {
  return (
    <div className="flex flex-col">
      <div>Auto Scroll</div>
      <button
        onClick={toggleAutoScroll}
        className={`mt-2 px-4 py-2 mx-auto ${
          autoScroll ? "bg-green-500" : "bg-gray-500"
        } text-white rounded`}
      >
        {autoScroll ? <Mouse /> : <MouseOff />}
      </button>
    </div>
  );
};

export default ScrollControl;
