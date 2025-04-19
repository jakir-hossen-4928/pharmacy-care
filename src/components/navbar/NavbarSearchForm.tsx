
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NavbarSearchFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isMobile: boolean;
  isSearchOpen?: boolean;
}

const NavbarSearchForm = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isMobile,
  isSearchOpen,
}: NavbarSearchFormProps) => {
  if (isMobile && !isSearchOpen) return null;

  return (
    <form 
      onSubmit={handleSearch} 
      className={`${
        isMobile 
          ? "absolute top-full left-0 right-0 bg-white p-4 shadow-md" 
          : "hidden md:flex flex-1 max-w-md mx-8"
      }`}
    >
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search medicines..."
          className="w-full pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus={isMobile}
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Search size={20} className="text-gray-500" />
        </button>
      </div>
    </form>
  );
};

export default NavbarSearchForm;
