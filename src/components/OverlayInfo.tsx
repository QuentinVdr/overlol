'use client';

import { useState } from 'react';

type OverlayInfoProps = {
  id: string;
  overlayUrl: string;
};

export default function OverlayInfo({ overlayUrl }: Readonly<OverlayInfoProps>) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-300 p-4">
      <h2 className="mb-4 text-lg font-semibold">Overlay Information</h2>

      <div className="flex flex-col gap-3">
        <p className="flex flex-row items-center gap-2">
          <span className="text-lg text-gray-600">Use Overlay:</span>
          <span>
            Add web source past the link bellow and set <b>width to 1920px</b> and{' '}
            <b>height to 1080px</b>. And Enable the option{' '}
            <b>Refresh browser when scene becomes active</b> to auto-refresh overlay
          </span>
        </p>

        <p className="flex flex-row items-center gap-2">
          <span className="text-lg text-gray-600">Overlay URL:</span>
          <div className="flex items-center gap-3 rounded border bg-gray-50 px-2 py-1">
            <code className="flex-1 font-mono text-sm break-all">{overlayUrl}</code>
            <button
              onClick={copyToClipboard}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </p>
      </div>
    </div>
  );
}
