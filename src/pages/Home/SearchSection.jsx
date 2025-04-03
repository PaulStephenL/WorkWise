import React from 'react';
import { Search } from 'lucide-react';

function SearchSection({ searchTerm, setSearchTerm }) {
  return (
    <div className="bg-[#101d42] rounded-lg p-8 mb-8 text-white">
      <h1 className="text-4xl font-bold mb-4">
        Find Your Dream Job Today
      </h1>
      <p className="text-lg mb-6">
        Browse through thousands of job opportunities and take the next step in your career.
      </p>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs, companies, or locations..."
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}

export default SearchSection; 