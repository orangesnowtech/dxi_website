"use client";

import { useState, useRef, useEffect } from "react";

interface SharePopupProps {
  url: string;
  onClose: () => void;
  onCopy: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function SharePopup({ url, onClose, onCopy, buttonRef }: SharePopupProps) {
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate position relative to the share button
    const calculatePosition = () => {
      if (buttonRef?.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const popupWidth = 320; // min-w-[320px] from className
        const viewportWidth = window.innerWidth;
        const padding = 16; // Padding from screen edges
        
        let left = buttonRect.left;
        
        // Check if dropdown would overflow on the right
        if (left + popupWidth > viewportWidth - padding) {
          // Align to right edge of button, or shift left if needed
          left = Math.max(
            padding, // Don't go past left edge
            buttonRect.right - popupWidth // Align to right edge of button
          );
        }
        
        setPosition({
          top: buttonRect.bottom + 8, // 8px gap below button
          left: left,
        });
      }
    };

    // Calculate position initially with a small delay to ensure button is rendered
    const timeoutId = setTimeout(calculatePosition, 0);

    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [buttonRef]);

  useEffect(() => {
    // Auto-select text when popup opens
    if (inputRef.current) {
      inputRef.current.select();
    }

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, buttonRef]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopy();
      
      // Hide "Copied!" message after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <>
      {/* Dropdown Popup */}
      <div
        ref={popupRef}
        className="fixed z-50 mt-2"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="bg-white rounded-lg shadow-xl p-3 min-w-[320px] max-w-[calc(100vw-32px)]">
          {/* Share link input with copy icon */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 bg-[#24292E] text-white rounded border border-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 cursor-text"
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="relative flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors relative group"
                title={copied ? "Copied!" : "Copy URL to clipboard"}
              >
                {copied ? (
                  <span className="text-sm font-medium text-green-600 whitespace-nowrap">Copied!</span>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
              {/* Tooltip on hover */}
              {!copied && (
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Copy URL to clipboard
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

