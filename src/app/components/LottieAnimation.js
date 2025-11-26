'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Lottie from 'lottie-react';

const LottieAnimation = ({ 
  animationData, 
  className = '', 
  loop = true,
  autoplay = true,
  style = {} 
}) => {
  return (
    <div className={`lottie-container ${className}`} style={style}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieAnimation;

