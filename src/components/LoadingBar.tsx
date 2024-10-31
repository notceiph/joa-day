import React from 'react';
import './LoadingBar.css'; // Import the new CSS file

interface LoadingBarProps {
  progress: number; // Progress percentage
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress }) => {
  console.log('LoadingBar progress:', progress);

  return (
    <div className="loading-bar-container">
      <div className="loading-bar shine" style={{ width: `${progress}%`, height: '30px' }} />
    </div>
  );
};

export default LoadingBar;