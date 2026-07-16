"use client";

import React, { useRef, useEffect } from "react";

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to its container size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = (rect?.width || 300) * window.devicePixelRatio;
      canvas.height = (rect?.height || 100) * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear canvas with a transparent overlay for trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.25)";
      ctx.fillRect(0, 0, width, height);

      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // 1. Calculate average frequency magnitude for beat pulse
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const pulseRadius = (avg / 255) * height * 0.9;

        // 2. Draw beat-synced radial ambient glow behind the bars
        const gradGlow = ctx.createRadialGradient(
          width / 2, height / 2, 5,
          width / 2, height / 2, Math.max(10, height / 2 + pulseRadius)
        );
        gradGlow.addColorStop(0, "rgba(34, 197, 94, 0.2)");   // Green
        gradGlow.addColorStop(0.5, "rgba(168, 85, 247, 0.1)"); // Purple
        gradGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradGlow;
        ctx.fillRect(0, 0, width, height);

        // Draw nice neon frequency bars
        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.85;

          // Gradient color: Purple to Green neon
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, "#22c55e"); // Neon Green
          grad.addColorStop(0.5, "#a855f7"); // Purple
          grad.addColorStop(1, "#3b82f6"); // Blue

          ctx.fillStyle = grad;
          // Draw rounded bars
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 1.5, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Render a flat glowing line when paused
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg bg-neutral-950/80 border border-neutral-800 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 left-3 text-[10px] text-neutral-500 font-mono tracking-widest pointer-events-none select-none">
        REAL-TIME SPECTROGRAM
      </div>
    </div>
  );
};

export default Visualizer;
