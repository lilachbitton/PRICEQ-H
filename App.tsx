import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProposalEditor from './ProposalEditor';
import ProposalPreview from './ProposalPreview';
import FinalProposalView from './FinalProposalView';
import SubcontractorProposalEditor from './SubcontractorProposalEditor';
import SubcontractorProposalPreview from './SubcontractorProposalPreview';
import FinalSubcontractorProposalView from './FinalSubcontractorProposalView';
import pako from 'pako';

// Helper function to encode data into a URL-safe, compressed string
export const encodeData = (data: object): string => {
    const jsonString = JSON.stringify(data);
    // Deflate (compress) the string, returns a Uint8Array
    const compressed = pako.deflate(jsonString);
    // Convert Uint8Array to a binary string that btoa can handle
    const binaryString = Array.from(compressed, (byte: number) => String.fromCharCode(byte)).join('');
    // Base64 encode, make it URL-safe, and remove padding
    return btoa(binaryString)
        .replace(/\+/g, '-') // Replace + with - for URL safety
        .replace(/\//g, '_') // Replace / with _ for URL safety
        .replace(/=+$/, ''); // Remove trailing padding
};

// Helper function to decode data from a URL-safe, compressed string
export const decodeData = <T extends {}>(encoded: string | undefined): T | null => {
    if (!encoded) return null;
    try {
        // Restore URL-safe replacements
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add back padding if it was removed
        while (base64.length % 4) {
            base64 += '=';
        }
        
        const binaryString = atob(base64);
        const compressed = new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));

        // Inflate (decompress) the string
        const jsonString = pako.inflate(compressed, { to: 'string' });
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error("Failed to decode or parse data:", error);
        return null;
    }
};

const CloseButton: React.FC = () => {
    const handleClose = () => {
        // This will attempt to close the current tab/window.
        // It's most effective for windows opened via window.open().
        window.close();
    };

    return (
        <button
            onClick={handleClose}
            className="fixed top-4 left-4 z-50 bg-gray-600 text-white px-3 py-1 rounded-full text-sm shadow-lg hover:bg-gray-700 transition-colors print:hidden"
            aria-label="סגירה"
        >
            סגירה
        </button>
    );
};

export default function App() {
    return (
        <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 print:p-0 print:max-w-full">
            <CloseButton />
            <Routes>
                {/* Customer Proposal Routes */}
                <Route path="/" element={<ProposalEditor />} />
                <Route path="/edit/:data" element={<ProposalEditor />} />
                <Route path="/proposal/:data" element={<ProposalPreview />} />
                <Route path="/final/:data" element={<FinalProposalView />} />

                {/* Subcontractor Agreement Routes */}
                <Route path="/subcontractor" element={<SubcontractorProposalEditor />} />
                <Route path="/subcontractor/edit/:data" element={<SubcontractorProposalEditor />} />
                <Route path="/subcontractor/preview/:data" element={<SubcontractorProposalPreview />} />
                <Route path="/subcontractor/final/:data" element={<FinalSubcontractorProposalView />} />
            </Routes>
        </div>
    );
}