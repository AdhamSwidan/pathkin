import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const CakeIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16h16" />
    <path d="M10 11V9" />
    <path d="M14 11V9" />
    <path d="M12 7a2 2 0 0 0-2-2c-2.5 0-2.5 4-5 4" />
    <path d="M12 7a2 2 0 0 1 2-2c2.5 0 2.5 4 5 4" />
  </svg>
);
export default CakeIcon;