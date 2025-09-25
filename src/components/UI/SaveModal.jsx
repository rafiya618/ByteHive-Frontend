// src/components/UI/SaveModal.jsx
import React, { useState } from 'react';

const SaveModal = ({ isOpen, onClose, onSave, postTitle }) => {
  const [selectedCategory, setSelectedCategory] = useState('Saved');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'Saved', label: 'Saved', icon: 'bookmark', description: 'Save for later reading' },
    { value: 'Watch Later', label: 'Watch Later', icon: 'schedule', description: 'Will remind you in 7 days' }
  ];

  const handleSave = async () => {
    if (loading) return;
    
    setLoading(true);
    await onSave(selectedCategory);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-navbar-bg rounded-lg p-6 w-full max-w-md border shadow-xl"
          style={{ borderColor: "var(--navbar-border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-fenix text-xl text-white">
              Save Post
            </h2>
            <button
              onClick={onClose}
              className="text-periwinkle hover:text-white transition-colors p-1"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Post Title */}
          <div className="mb-6">
            <p className="text-desc text-sm mb-2">You're saving:</p>
            <p className="text-white font-medium text-sm line-clamp-2">
              {postTitle}
            </p>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <p className="text-white font-medium mb-3">Choose category:</p>
            <div className="space-y-3">
              {categories.map((category) => (
               <label
  key={category.value}
  className={`flex items-start space-x-3 p-3 rounded-md border cursor-pointer transition-colors ${
    selectedCategory === category.value
      ? 'border-white bg-periwinkle bg-opacity-10'
      : 'border-navbar-border hover:border-periwinkle hover:bg-periwinkle hover:bg-opacity-5'
  }`}
>

                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={selectedCategory === category.value}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`material-icons mt-0.5 ${
                    selectedCategory === category.value ? 'text-periwinkle' : 'text-desc'
                  }`}>
                    {category.icon}
                  </span>
                  <div className="flex-1">
                    <div className={`font-lato font-medium ${
                      selectedCategory === category.value ? 'text-periwinkle' : 'text-white'
                    }`}>
                      {category.label}
                    </div>
                    <div className="text-desc text-sm">
                      {category.description}
                    </div>
                  </div>
                  {selectedCategory === category.value && (
                    <span className="material-icons text-periwinkle mt-0.5">
                      check_circle
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-periwinkle border border-periwinkle rounded-md hover:bg-periwinkle hover:bg-opacity-10 transition-colors font-lato disabled:opacity-50"
            >
              Cancel
            </button>
        <button
  onClick={handleSave}
  disabled={loading}
  className="px-4 py-2 text-periwinkle border border-periwinkle rounded-md hover:bg-periwinkle hover:text-white transition-colors font-lato flex items-center space-x-2 disabled:opacity-50"

>
  {loading && <span className="material-icons animate-spin text-sm">sync</span>}
  <span>{loading ? 'Saving...' : 'Save'}</span>
</button>

          </div>
        </div>
      </div>
    </>
  );
};

export default SaveModal;