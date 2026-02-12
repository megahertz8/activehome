"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2 } from "lucide-react";

interface ShareDialogProps {
  data: {
    address: string;
    currentRating: string;
    potentialRating: string;
    livePricing?: { liveSavings: number };
    annualSavings: number;
    solar?: { annualGeneration_kWh: number };
  };
  ogImageUrl: string;
}

export default function ShareDialog({ data, ogImageUrl }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `My home's energy score: ${data.currentRating} → ${data.potentialRating}. Save £${data.livePricing?.liveSavings || data.annualSavings}/year! Check yours at evolvinghome.ai`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = async (format: 'og' | 'square' = 'og') => {
    try {
      const imageUrl = format === 'square' ? ogImageUrl.replace('/api/og?', '/api/og?format=square&') : ogImageUrl;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-energy-score-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-700">
          <Share2 className="mr-2 h-4 w-4" />
          Share My Score
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1c1c28] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#4ecdc4]">Share Your Energy Score</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleCopyLink} variant="outline" className="w-full">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={() => handleDownload('og')} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download OG Card (1200x630)
          </Button>
          <Button onClick={() => handleDownload('square')} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Instagram Square (1080x1080)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full">
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                🐦 Twitter
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                💬 WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer">
                ✈️ Telegram
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                📘 Facebook
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}