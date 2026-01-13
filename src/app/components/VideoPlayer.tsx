"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  videoFileUrl?: string;
  thumbnailUrl?: string;
  thumbnail?: any; // Sanity image object
  alt?: string;
}

export default function VideoPlayer({ 
  videoUrl, 
  videoFileUrl, 
  thumbnailUrl,
  thumbnail,
  alt = 'Video' 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  // Get thumbnail from Sanity image object if provided, or use thumbnailUrl
  useEffect(() => {
    const loadThumbnail = async () => {
      if (thumbnailUrl) {
        // Use preprocessed thumbnailUrl if available
        setThumbnailSrc(thumbnailUrl);
      } else if (thumbnail) {
        // Process Sanity image object if thumbnailUrl not provided
        try {
          const { urlFor } = await import('@/lib/sanity/client');
          const thumbUrl = urlFor(thumbnail).width(1200).height(800).url();
          setThumbnailSrc(thumbUrl);
        } catch (error) {
          console.error('Error loading thumbnail:', error);
          setThumbnailSrc(null);
        }
      } else {
        setThumbnailSrc(null);
      }
    };
    loadThumbnail();
  }, [thumbnail, thumbnailUrl]);

  const handlePlay = () => {
    setIsPlaying(true);
    // Small delay to ensure video element is mounted
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      }
    }, 100);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // Determine video source
  const getVideoSource = () => {
    if (videoFileUrl) {
      return videoFileUrl;
    }
    if (videoUrl) {
      // Handle YouTube Live URLs (youtube.com/live/)
      if (videoUrl.includes('youtube.com/live/')) {
        const videoId = videoUrl.split('youtube.com/live/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      }
      // Handle YouTube Watch URLs (youtube.com/watch?v=)
      if (videoUrl.includes('youtube.com/watch')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      }
      // Handle YouTube Short URLs (youtu.be/)
      if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      }
      // Handle Vimeo URLs
      if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }
      }
      // Direct video URL
      return videoUrl;
    }
    return null;
  };

  const videoSource = getVideoSource();
  const isEmbedded = videoSource?.includes('youtube.com/embed') || videoSource?.includes('vimeo.com/video') || videoUrl?.includes('youtube.com') || videoUrl?.includes('vimeo.com');

  if (!videoSource) {
    return null;
  }

  // For embedded videos (YouTube/Vimeo) - always use iframe, never use video element
  if (isEmbedded && videoSource) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        {!isPlaying ? (
          <>
            {thumbnailSrc ? (
              <div className="absolute inset-0 z-10">
                <Image
                  src={thumbnailSrc}
                  alt={alt}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gray-900 z-10" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
              <button
                onClick={handlePlay}
                className="w-20 h-20 rounded-full bg-[#EF1111] flex items-center justify-center hover:bg-[#d00] transition-colors shadow-lg"
                aria-label="Play video"
                type="button"
              >
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </button>
            </div>
          </>
        ) : (
          <iframe
            key={videoSource} // Force re-render when source changes
            src={videoSource}
            className="w-full h-full absolute inset-0 z-30"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title={alt}
            style={{ border: 'none' }}
          />
        )}
      </div>
    );
  }

  // For direct video files
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      {/* Always render video element but control visibility */}
      <video
        ref={videoRef}
        src={videoSource || undefined}
        className={`w-full h-full absolute inset-0 ${isPlaying ? 'z-20' : 'z-0 opacity-0 pointer-events-none'}`}
        controls
        onPause={handlePause}
        onEnded={handlePause}
        playsInline
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Thumbnail and play button overlay */}
      {!isPlaying && (
        <>
          {thumbnailSrc ? (
            <div className="absolute inset-0 z-10">
              <Image
                src={thumbnailSrc}
                alt={alt}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gray-900 z-10" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-[#EF1111] flex items-center justify-center hover:bg-[#d00] transition-colors shadow-lg"
              aria-label="Play video"
              type="button"
            >
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

