import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const LoadingSpinner = ({ size = 40 }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <ThreeDots
        height={size}
        width={size}
        radius="9"
        color="#4361ee"
        ariaLabel="loading"
      />
    </div>
  );
};

export default LoadingSpinner;