const ScrollControl: React.FC<{ autoScroll: boolean; toggleAutoScroll: () => void }> = ({
    autoScroll,
    toggleAutoScroll,
  }) => {
    return (
      <div className="flex flex-col">
        <div>Auto Scroll</div>
        <button
          onClick={toggleAutoScroll}
          className={`mt-2 px-4 py-2 ${autoScroll ? "bg-green-500" : "bg-gray-500"} text-white rounded`}
        >
          {autoScroll ? "Disable" : "Enable"}
        </button>
      </div>
    );
  };
  
  export default ScrollControl;
  