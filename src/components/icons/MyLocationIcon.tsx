import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const MyLocationIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <line x1="21" y1="12" x2="19" y2="12" />
    <line x1="5" y1="12" x2="3" y2="12" />
    <line x1="12" y1="21" x2="12" y2="19" />
    <line x1="12" y1="5" x2="12" y2="3" />
  </svg>
);

export default MyLocationIcon;