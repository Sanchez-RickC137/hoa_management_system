import React from 'react';

const ImageDisplay = ({ imageData, mimeType, altText }) => {
  if (!imageData) return null;

  const base64Image = `data:${mimeType};base64,${imageData}`;

  return (
    <img 
      src={base64Image} 
      alt={altText}
      className="w-full h-full object-cover"
      onError={(e) => {
        console.error('Error loading image:', e);
        e.target.style.display = 'none';
      }}
    />
  );
};

export default ImageDisplay;