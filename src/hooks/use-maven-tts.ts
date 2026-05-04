import { useState, useRef, useCallback, useEffect } from "react";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

export function useMavenTTS() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      const src = audioRef.current.src;
      audioRef.current.src = "";
      if (src.startsWith("blob:")) URL.revokeObjectURL(src);
      audioRef.current = null;
    }
    setPlayingIdx(null);
    setLoadingIdx(null);
  }, []);

  const play = useCallback(async (text: string, idx: number) => {
    stop();
    setLoadingIdx(idx);
    try {
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) throw new Error("TTS failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlayingIdx(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlayingIdx(null); URL.revokeObjectURL(url); };
      setLoadingIdx(null);
      setPlayingIdx(idx);
      await audio.play();
    } catch {
      setLoadingIdx(null);
      setPlayingIdx(null);
    }
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { play, stop, playingIdx, loadingIdx };
}