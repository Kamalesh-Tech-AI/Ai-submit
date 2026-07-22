'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from './Button';
import { Download } from 'lucide-react';

interface QRDisplayProps {
  value: string;
  size?: number;
  label?: string;
  onDownload?: () => void;
  downloading?: boolean;
}

export default function QRDisplay({ value, size = 200, label, onDownload, downloading = false }: QRDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${label || 'ai-submit-pass'}.svg`;
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

      <div ref={containerRef} className="bg-white p-4 rounded-lg shadow-inner">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: '/images/qr_logo.png',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="mt-4 gap-2 text-xs no-export"
        onClick={downloadQR}
        disabled={downloading}
      >
        <Download className="w-4 h-4" />
        {downloading ? 'Downloading Card...' : 'Download Pass'}
      </Button>
    </div>
  );
}
