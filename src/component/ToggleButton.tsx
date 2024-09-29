const ToggleButton: React.FC<{ isActive: boolean; onClick: () => void; label: string }> = ({
    isActive,
    onClick,
    label,
  }) => {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded ${isActive ? "bg-green-500" : "bg-gray-500"} text-white`}
      >
        {label}
      </button>
    );
  };
  
  export default ToggleButton;
  