import React, { useMemo } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import ProposalEditor from './ProposalEditor';
import ProposalPreview from './ProposalPreview';
import FinalProposalView from './FinalProposalView';

// Helper function to encode data into a URL-safe string
export const encodeData = (data: object): string => {
    const jsonString = JSON.stringify(data);
    // To handle Unicode characters, as btoa works on byte streams
    const utf8String = unescape(encodeURIComponent(jsonString));
    return btoa(utf8String);
};

// Helper function to decode data from a URL-safe string
export const decodeData = <T extends {}>(encoded: string | undefined): T | null => {
    if (!encoded) return null;
    try {
        const utf8String = atob(encoded);
        const jsonString = decodeURIComponent(escape(utf8String));
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error("Failed to decode or parse data:", error);
        return null;
    }
};


export default function App() {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-full">
            <Routes>
                <Route path="/" element={<ProposalEditor />} />
                <Route path="/proposal/:data" element={<ProposalPreview />} />
                <Route path="/final/:data" element={<FinalProposalView />} />
            </Routes>
        </div>
    );
}