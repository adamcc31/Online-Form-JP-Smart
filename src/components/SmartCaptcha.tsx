'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface CaptchaChallenge {
  question: string;
  answer: number;
}

interface SmartCaptchaProps {
  onVerified: (verified: boolean) => void;
}

function generateChallenge(): CaptchaChallenge {
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a: number, b: number, answer: number;

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
      break;
  }

  return { question: `${a} ${op} ${b} = ?`, answer: answer! };
}

function drawCaptcha(canvas: HTMLCanvasElement, question: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(1, '#312e81');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Noise lines
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h
    );
    ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Text with distortion
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Draw each character with slight rotation
  const chars = question.split('');
  const startX = w / 2 - (chars.length * 14) / 2;

  chars.forEach((char, i) => {
    ctx.save();
    const x = startX + i * 16 + 8;
    const y = h / 2 + (Math.random() * 6 - 3);
    const rotation = (Math.random() * 0.3) - 0.15;

    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = `hsl(${200 + Math.random() * 60}, 80%, ${75 + Math.random() * 20}%)`;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

export const SmartCaptcha: React.FC<SmartCaptchaProps> = ({ onVerified }) => {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTime = useRef<number>(Date.now());

  const refreshChallenge = useCallback(() => {
    const c = generateChallenge();
    setChallenge(c);
    setUserAnswer('');
    setError(false);
    setVerified(false);
    onVerified(false);
    startTime.current = Date.now();
  }, [onVerified]);

  useEffect(() => {
    refreshChallenge();
  }, [refreshChallenge]);

  useEffect(() => {
    if (challenge && canvasRef.current) {
      drawCaptcha(canvasRef.current, challenge.question);
    }
  }, [challenge]);

  const handleVerify = () => {
    if (!challenge) return;

    // Anti-bot: reject if answered too fast (< 1 second)
    const elapsed = Date.now() - startTime.current;
    if (elapsed < 1000) {
      setError(true);
      setAttempts(a => a + 1);
      refreshChallenge();
      return;
    }

    const parsed = parseInt(userAnswer, 10);
    if (parsed === challenge.answer) {
      setVerified(true);
      setError(false);
      onVerified(true);
    } else {
      setError(true);
      setAttempts(a => a + 1);
      if (attempts >= 2) {
        // Regenerate after 3 failed attempts
        refreshChallenge();
      }
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 animate-in zoom-in-95 duration-300">
        <ShieldCheck className="w-6 h-6 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Verifikasi berhasil ✓
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">
        Verifikasi Keamanan <span className="text-rose-500">*</span>
      </label>
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
        {/* Canvas Captcha */}
        <div className="flex items-center gap-3">
          <canvas
            ref={canvasRef}
            width={220}
            height={60}
            className="rounded-lg border border-gray-300 dark:border-gray-600 shadow-inner"
          />
          <button
            type="button"
            onClick={refreshChallenge}
            className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
            title="Ganti soal"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Answer Input */}
        <div className="flex gap-2">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleVerify(); } }}
            placeholder="Jawaban..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={!userAnswer}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Verifikasi
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-500 animate-in slide-in-from-top-1">
            Jawaban salah. Silakan coba lagi.
          </p>
        )}
      </div>

      {/* Honeypot field — invisible to humans, bots will fill it */}
      <input
        type="text"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
      />
    </div>
  );
};
