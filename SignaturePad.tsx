import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
    onSignatureChange: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Use a ref for drawing state to prevent re-renders and effect re-runs
    const isDrawingRef = useRef(false);
    const [hasSigned, setHasSigned] = useState(false);

    // This effect runs only once on mount to set up the canvas and event listeners.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const setupCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            context.strokeStyle = '#000000';
            context.lineWidth = 2;
            context.lineCap = 'round';
            // When resizing, clear the signature
            onSignatureChange('');
            setHasSigned(false);
        };
        
        setupCanvas();
        window.addEventListener('resize', setupCanvas);

        const getCoords = (event: MouseEvent | TouchEvent): { x: number, y: number } => {
            const rect = canvas.getBoundingClientRect();
            if (event instanceof MouseEvent) {
                return { x: event.clientX - rect.left, y: event.clientY - rect.top };
            }
            return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
        };

        const startDrawing = (event: MouseEvent | TouchEvent) => {
            event.preventDefault();
            const { x, y } = getCoords(event);
            context.beginPath();
            context.moveTo(x, y);
            isDrawingRef.current = true;
            setHasSigned(true);
        };

        const draw = (event: MouseEvent | TouchEvent) => {
            if (!isDrawingRef.current) return;
            event.preventDefault();
            const { x, y } = getCoords(event);
            context.lineTo(x, y);
            context.stroke();
        };

        const stopDrawing = () => {
            if (!isDrawingRef.current) return;
            context.closePath();
            isDrawingRef.current = false;
            onSignatureChange(canvas.toDataURL('image/png'));
        };

        // Add event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', setupCanvas);
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [onSignatureChange]); // Dependency array is stable, so this runs once.

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        onSignatureChange('');
        setHasSigned(false);
    };

    return (
        <div className="relative w-full">
            <canvas
                ref={canvasRef}
                className="w-full h-40 bg-gray-50 border-2 border-dotted border-gray-400 rounded-md cursor-crosshair touch-none"
            />
            {!hasSigned && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                    <span>חתום כאן</span>
                </div>
            )}
            <button
                type="button"
                onClick={clearSignature}
                className="absolute top-2 left-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
            >
                נקה
            </button>
        </div>
    );
};

export default SignaturePad;
