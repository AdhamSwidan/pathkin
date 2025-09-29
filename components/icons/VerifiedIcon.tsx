import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const VerifiedIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 10.5a1 1 0 0 1 .5-.866l7-4a1 1 0 0 1 1 0l7 4a1 1 0 0 1 .5.866v7a1 1 0 0 1-.5.866l-7 4a1 1 0 0 1-1 0l-7-4a1 1 0 0 1-.5-.866v-7z" />
        <polyline points="7 12.5 10 15.5 17 8.5" className={props.className?.includes('text-white') ? "stroke-current" : ""} />
    </svg>
);

export default VerifiedIcon;
