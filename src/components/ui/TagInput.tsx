import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ value, onChange, suggestions = [], placeholder }) => {
  const [input, setInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setFilteredSuggestions(
      suggestions.filter(
        (s) => s.toLowerCase().includes(val.toLowerCase()) && !value.includes(s)
      )
    );
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput('');
      setFilteredSuggestions([]);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!value.includes(suggestion)) {
      onChange([...value, suggestion]);
    }
    setInput('');
    setFilteredSuggestions([]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border rounded px-2 py-1 bg-white">
      {value.map((tag) => (
        <span key={tag} className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm mr-1">
          {tag}
          <button type="button" className="ml-1 text-gray-500 hover:text-red-500" onClick={() => removeTag(tag)}>
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] border-none outline-none bg-transparent"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder || 'Add tag...'}
      />
      {filteredSuggestions.length > 0 && (
        <div className="absolute mt-8 bg-white border rounded shadow-lg z-10">
          {filteredSuggestions.map((s) => (
            <div
              key={s}
              className="px-2 py-1 cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSuggestionClick(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
