import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const BicycleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 17.5h-5.5l1.5-5 4-3 2 3h-3" />
        <path d="M5.5 14l-3-3" />
    </svg>
);

export default BicycleIcon;
