import type { FC } from 'react';

interface LogoProps {
    className?: string;
}

const NewSebairTelLogo: FC<LogoProps> = ({ className }) => (
    <svg width="36" height="36" viewBox="0 0 100 100" className={className}>
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#34D399'}} />
                <stop offset="50%" style={{stopColor: '#3B82F6'}} />
                <stop offset="100%" style={{stopColor: '#A78BFA'}} />
            </linearGradient>
        </defs>
        <path d="M50 10 A 40 40 0 1 1 49 10" stroke="url(#logoGradient)" strokeWidth="8" fill="none" transform="rotate(15 50 50)"/>
        <path d="M50 10 A 40 40 0 1 1 49 10" stroke="url(#logoGradient)" strokeWidth="8" fill="none" transform="rotate(90 50 50)"/>
        <path d="M10 50 A 40 40 0 1 1 10 49" stroke="url(#logoGradient)" strokeWidth="8" fill="none" transform="rotate(45 50 50)"/>
        <circle cx="20" cy="20" r="5" fill="url(#logoGradient)" />
        <circle cx="80" cy="20" r="5" fill="url(#logoGradient)" />
        <circle cx="20" cy="80" r="5" fill="url(#logoGradient)" />
        <circle cx="80" cy="80" r="5" fill="url(#logoGradient)" />
        <circle cx="50" cy="50" r="3" fill="white" />
    </svg>
);

export default NewSebairTelLogo;
