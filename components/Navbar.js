import React from 'react';
import { Search } from 'lucide-react';

const tags = ["All", "Computer Science", "Web Development", "AI", "Blockchain", "Design", "Marketing", "Business"];

export default function Navbar() {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">YC</h1>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses"
                className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <w3m-button label="Login" balance="hide" />
        </div>

        {/* Tags */}
        <div className="flex mt-4 gap-3 overflow-x-auto py-3 no-scrollbar">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                tag === "All"
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}