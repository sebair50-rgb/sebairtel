import type { FC } from 'react';

interface LogoProps {
    className?: string;
}

const NewSebairTelLogo: FC<LogoProps> = ({ className }) => (
    <svg width="48" height="48" viewBox="0 0 100 100" className={className}>
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'hsl(145, 63%, 50%)'}} />
                <stop offset="50%" style={{stopColor: 'hsl(220, 85%, 55%)'}} />
                <stop offset="100%" style={{stopColor: 'hsl(280, 85%, 60%)'}} />
            </linearGradient>
        </defs>

        <g strokeWidth="5" stroke="url(#logoGradient)" fill="none">
            {/* Outer Orbit */}
            <ellipse cx="50" cy="50" rx="45" ry="45" style={{opacity: 0.8}} />
            {/* Tilted Orbits */}
            <ellipse cx="50" cy="50" rx="45" ry="25" transform="rotate(30 50 50)" />
            <ellipse cx="50" cy="50" rx="45" ry="25" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx="15" ry="45" transform="rotate(50 50 50)" />
            <ellipse cx="50" cy="50" rx="15" ry="45" transform="rotate(-50 50 50)" />
        </g>
        
        <g fill="url(#logoGradient)">
             {/* Major Nodes */}
            <circle cx="20" cy="30" r="6" />
            <circle cx="80" cy="70" r="6" />
            <circle cx="30" cy="80" r="6" />
            <circle cx="70" cy="20" r="6" />

             {/* Minor Nodes */}
            <circle cx="50" cy="5" r="3" />
            <circle cx="95" cy="50" r="3" />
            <circle cx="5" cy="50" r="3" />
            <circle cx="50" cy="95" r="3" />
        </g>
    </svg>
);

export default NewSebairTelLogo;
