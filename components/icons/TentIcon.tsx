import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const TentIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 20 L19 10 L12 3 L5 10 L5 20" />
        <path d="M12 11 L12 20" />
        <path d="M3 20 L21 20" />
    </svg>
);

export default TentIcon;
