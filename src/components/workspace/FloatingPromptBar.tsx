'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, Wand2, Compass } from 'lucide-react';

interface FloatingPromptBarProps {
  onSubmit: (prompt: string, method: 'text' | 'voice') => void;
  isLoading: boolean;
}

export const FloatingPromptBar: React.FC<FloatingPromptBarProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false);

  // Suggested prompt chips matching spatial intelligence SRS
  const promptSuggestions = [
    'Move the sofa against the left wall',
    'Center the sofa and coffee table',
    'Paint accent wall Nordic Sage Green',
    'Update flooring to Scandinavian Light Oak',
    'Clear 90cm pathway towards doorway',
  ];

  useEffect(() => {
    // Check for web speech recognition support
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceSupported(true);
    }
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);

    // If browser supports web speech API, use it, otherwise simulate realistic voice transcription
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
        onSubmit(transcript, 'voice');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Friendly voice simulation
      setTimeout(() => {
        const simulatedVoicePrompt = 'Move the sofa against the left wall';
        setPrompt(simulatedVoicePrompt);
        setIsListening(false);
        onSubmit(simulatedVoicePrompt, 'voice');
      }, 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, 'text');
    setPrompt('');
  };

  const handleChipClick = (suggestion: string) => {
    setPrompt(suggestion);
    onSubmit(suggestion, 'text');
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[760px] flex flex-col items-center gap-2 z-20 font-ember select-none">
      {/* Quick Prompt Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
        <span className="text-[11px] font-semibold text-[#8c8c94] px-1 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#ff9900]" /> Suggestions:
        </span>
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(suggestion)}
            className="text-[11px] bg-[#16191f]/90 hover:bg-[#232b37] border border-[#343d4d] hover:border-[#ff9900]/60 text-[#aab2bd] hover:text-white px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-colors backdrop-blur-md shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Main Input Container */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#1b222d]/95 backdrop-blur-md border border-[#343d4d] focus-within:border-[#ff9900] rounded-[4px] p-2 flex items-center gap-2 shadow-[0px_8px_30px_rgba(0,0,0,0.5)] transition-all"
      >
        <div className="pl-2 text-[#ff9900]">
          <Wand2 className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            isListening
              ? 'Listening for spatial instruction (e.g., "Rotate sofa 90 degrees")...'
              : "Describe changes (e.g., 'Move sofa to left wall', 'Paint room navy blue')..."
          }
          className="flex-1 bg-transparent border-none text-white px-2 text-[14px] placeholder-[#687078] focus:outline-none"
        />

        {/* Voice Toggle Button */}
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`p-2 rounded-[4px] transition-colors flex items-center justify-center ${
            isListening
              ? 'bg-[#d9383a] text-white animate-pulse'
              : 'text-[#8c8c94] hover:text-white hover:bg-[#232b37]'
          }`}
          title={isListening ? 'Stop listening' : 'Speak instruction (Natural Voice Input)'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Generate / Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="bg-[#ff9900] hover:bg-[#ec8c00] active:bg-[#d88000] text-[#16191f] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-[4px] font-semibold text-[13px] flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#16191f] border-t-transparent rounded-full animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span>Generate</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
