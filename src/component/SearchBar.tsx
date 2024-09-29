import { Search, SearchX } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const resetSearch = () => setSearchTerm("");

  return (
    <div className="relative mb-4">
      {searchTerm ? (
        <SearchX
          onClick={resetSearch}
          className="absolute left-2 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer"
        />
      ) : (
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400" />
      )}
      <input
        type="text"
        placeholder="Search by title or artist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-8 pr-10 py-2 rounded-md text-sm
          bg-gray-100 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring focus:ring-blue-300 
          transition-colors duration-300"
      />
    </div>
  );
};

export default SearchBar;
