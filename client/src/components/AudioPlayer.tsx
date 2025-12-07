import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  text: string;
  title?: string;
  className?: string;
}

export default function AudioPlayer({ text, title = "บทความ", className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    if (!SpeechSynthesisUtterance) {
      setIsSupported(false);
      return;
    }

    // Create utterance
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.lang = "th-TH"; // Thai language
    newUtterance.rate = 0.9; // Slightly slower for clarity
    newUtterance.pitch = 1;
    newUtterance.volume = 1;

    // Event listeners
    newUtterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
    };

    newUtterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    newUtterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    setUtterance(newUtterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    if (!utterance || !isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (isSpeaking) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3 p-4 bg-muted rounded-lg border border-border/50", className)}>
      <Volume2 className="w-5 h-5 text-accent flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground/80">อ่านให้ฟัง</p>
        <p className="text-xs text-muted-foreground truncate">{title}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePlay}
          className="h-8 w-8 p-0"
          title={isPlaying ? "หยุดชั่วคราว" : "เล่น"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleStop}
          className="h-8 w-8 p-0"
          title="หยุด"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
