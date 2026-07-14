'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Button from './Button';
import { Download } from 'lucide-react';

interface QRDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export default function QRDisplay({ value, size = 200, label }: QRDisplayProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${label || 'ai-submit-pass'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-surface border border-border-card rounded-lg relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent-signal" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent-signal" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent-signal" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent-signal" />

      <div ref={canvasRef} className="bg-white p-4 rounded-lg shadow-inner">
        <QRCodeCanvas
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: 'https://unaitech.com/favicon.ico', // Fallback or brand logo in center
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-text-muted select-all">
          TOKEN: {value.length > 20 ? `${value.substring(0, 8)}...` : value}
        </p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="mt-4 gap-2 text-xs"
        onClick={downloadQR}
      >
        <Download className="w-4.5 h-4.5" />
        Download Pass
      </Button>
    </div>
  );
}
