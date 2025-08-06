import React from 'react';

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const LOGO_URL = "http://www.m-ganim.com/images/logo.png";

export const HeaderLogo: React.FC = () => (
    <div className="flex justify-center items-center my-4">
        <img src={LOGO_URL} alt="Hagay Tadmor Logo" className="h-28" />
    </div>
);

export const Watermark: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none print-exact">
        <img 
            src={LOGO_URL} 
            alt="Watermark" 
            className="w-3/5 opacity-5"
        />
    </div>
);

const HEADER_IMAGES = [
  "http://www.m-ganim.com/uploads/1/6/7/6/16762338/background-images/1384849348.jpg",
  "http://www.m-ganim.com/uploads/1/6/7/6/16762338/published/p1000627.jpg?1542888599",
  "http://www.m-ganim.com/uploads/1/6/7/6/16762338/p1000570_orig.jpg",
  "http://www.m-ganim.com/uploads/1/6/7/6/16762338/p1000539_orig.jpg",
];

export const ProposalHeaderStrip: React.FC = () => (
    <div className="grid grid-cols-4 print-exact">
        {HEADER_IMAGES.map((src, index) => (
            <div key={index} className="h-28 sm:h-32 md:h-40">
                <img src={src} alt={`Header image ${index + 1}`} className="w-full h-full object-cover" />
            </div>
        ))}
    </div>
);