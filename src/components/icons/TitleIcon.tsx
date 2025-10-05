import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const TitleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.5" />
    <path d="M12 2v10" />
    <path d="M9 4h6" />
  </svg>
);

export default TitleIcon;