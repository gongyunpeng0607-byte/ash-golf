"use client";

import { useState, useEffect } from "react";
import { X, Volume2, Play, Settings } from "lucide-react";

// 预设提示音色
export const TONE_PRESETS = [
  { id: "bell", name: "風鈴", icon: "🎐", melody: [523.25, 659.25, 783.99, 1046.5], wave: "triangle" as OscillatorType },
  { id: "chime", name: "水晶", icon: "💎", melody: [587.33, 880.0, 1174.66], wave: "sine" as OscillatorType },
  { id: "piano", name: "鋼琴", icon: "🎹", melody: [261.63, 329.63, 392.0, 523.25], wave: "triangle" as OscillatorType },
  { id: "ding", name: "收銀", icon: "💰", melody: [800, 1000], wave: "square" as OscillatorType },
  { id: "spa", name: "SPA", icon: "🧘", melody: [440, 554.37, 659.25, 880], wave: "sine" as OscillatorType },
  { id: "alert", name: "通知", icon: "📢", melody: [988, 784, 988, 784], wave: "sawtooth" as OscillatorType },
];

// 预设播报语
const MESSAGE_PRESETS = [
  { id: "cute", text: "叮咚～ 您有 {n} 筆新的訂單，請及時查看哦", label: "可愛風" },
  { id: "pro", text: "通知：收到 {n} 筆新訂單，請盡快處理", label: "專業風" },
  { id: "simple", text: "新訂單 {n} 筆", label: "簡潔風" },
  { id: "money", text: "老闆～ 進帳了！{n} 筆新訂單", label: "老闆風" },
];

export interface SoundSettings {
  toneId: string;
  messageId: string;
  rate: number;   // 0.7-1.5
  pitch: number;  // 0.8-2.0
  volume: number; // 0.1-1.0
}

const DEFAULT: SoundSettings = { toneId: "bell", messageId: "cute", rate: 0.9, pitch: 1.35, volume: 0.8 };

function loadSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem("order_sound_settings");
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT };
}

function saveSettings(s: SoundSettings) {
  try { localStorage.setItem("order_sound_settings", JSON.stringify(s)); } catch {}
}

// 预览播放
export function playPreview(settings: SoundSettings) {
  const tone = TONE_PRESETS.find(t => t.id === settings.toneId) || TONE_PRESETS[0];
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    tone.melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25 * settings.volume, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
  } catch {}
}

// 新订单通知
export function fireOrderSound(settings: SoundSettings, count: number) {
  playPreview(settings);

  // TTS 语音
  try {
    if ("speechSynthesis" in window) {
      const msg = MESSAGE_PRESETS.find(m => m.id === settings.messageId) || MESSAGE_PRESETS[0];
      const text = msg.text.replace("{n}", String(count));

      const speak = () => {
        window.speechSynthesis.cancel();
        setTimeout(() => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "zh-TW";
          u.rate = settings.rate;
          u.pitch = settings.pitch;
          u.volume = settings.volume;

          const voices = window.speechSynthesis.getVoices();
          const female = voices.find(v =>
            v.lang.startsWith("zh") &&
            (v.name.includes("Ting-Ting") || v.name.includes("Mei-Jia") ||
             v.name.includes("Female") || v.name.toLowerCase().includes("female"))
          ) || voices.find(v => v.lang.startsWith("zh-TW")) ||
            voices.find(v => v.lang.startsWith("zh"));
          if (female) u.voice = female;

          window.speechSynthesis.speak(u);
        }, 200);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speak();
      } else {
        window.speechSynthesis.onvoiceschanged = speak;
      }
    }
  } catch {}
}

export function useOrderSound() {
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT);

  useEffect(() => { setSettings(loadSettings()); }, []);

  const update = (partial: Partial<SoundSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  };

  return { settings, update };
}

export function OrderSoundPanel({ settings, update, onClose }: {
  settings: SoundSettings;
  update: (s: Partial<SoundSettings>) => void;
  onClose: () => void;
}) {
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const load = () => setSystemVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("zh")));
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  const handleTest = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const msg = MESSAGE_PRESETS.find(m => m.id === settings.messageId) || MESSAGE_PRESETS[0];
      const u = new SpeechSynthesisUtterance(msg.text.replace("{n}", "3"));
      u.lang = "zh-TW";
      u.rate = settings.rate;
      u.pitch = settings.pitch;
      u.volume = settings.volume;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold flex items-center gap-2"><Settings className="h-4 w-4"/> 來單提醒設定</h2>
          <button onClick={onClose} className="p-1 hover:bg-ash-gray-50"><X className="h-4 w-4"/></button>
        </div>

        {/* 提示音色 */}
        <div className="mb-6">
          <p className="text-[10px] tracking-wider uppercase text-ash-gray-400 mb-3 font-medium">提示音色</p>
          <div className="grid grid-cols-3 gap-2">
            {TONE_PRESETS.map(t => (
              <button
                key={t.id}
                onClick={() => update({ toneId: t.id })}
                className={`flex flex-col items-center gap-1 p-3 border text-xs transition-colors ${
                  settings.toneId === t.id ? "border-ash-black bg-ash-gray-50 font-bold" : "border-ash-gray-200 hover:border-ash-black"
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span>{t.name}</span>
                <button onClick={e => { e.stopPropagation(); playPreview(settings); }} className="text-[10px] text-ash-gray-400 hover:text-ash-black flex items-center gap-1">
                  <Play className="h-2.5 w-2.5"/>試聽
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* 播报风格 */}
        <div className="mb-6">
          <p className="text-[10px] tracking-wider uppercase text-ash-gray-400 mb-3 font-medium">播報風格</p>
          <div className="space-y-1.5">
            {MESSAGE_PRESETS.map(m => (
              <button
                key={m.id}
                onClick={() => update({ messageId: m.id })}
                className={`w-full text-left px-3 py-2 border text-xs transition-colors ${
                  settings.messageId === m.id ? "border-ash-black bg-ash-gray-50 font-bold" : "border-ash-gray-200 hover:border-ash-black"
                }`}
              >
                <p className="text-[11px]">{m.label}</p>
                <p className="text-[10px] text-ash-gray-400 truncate">{m.text.replace("{n}", "3")}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 音色参数 */}
        <div className="mb-6 space-y-3">
          <p className="text-[10px] tracking-wider uppercase text-ash-gray-400 font-medium">語音參數</p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] w-12 text-ash-gray-500">語速</span>
            <input type="range" min="0.7" max="1.5" step="0.05" value={settings.rate}
              onChange={e => update({ rate: parseFloat(e.target.value) })}
              className="flex-1 accent-black" />
            <span className="text-[11px] text-ash-gray-400 w-8">{settings.rate.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] w-12 text-ash-gray-500">音調</span>
            <input type="range" min="0.8" max="2.0" step="0.05" value={settings.pitch}
              onChange={e => update({ pitch: parseFloat(e.target.value) })}
              className="flex-1 accent-black" />
            <span className="text-[11px] text-ash-gray-400 w-8">{settings.pitch.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] w-12 text-ash-gray-500">音量</span>
            <input type="range" min="0.1" max="1.0" step="0.1" value={settings.volume}
              onChange={e => update({ volume: parseFloat(e.target.value) })}
              className="flex-1 accent-black" />
            <span className="text-[11px] text-ash-gray-400 w-8">{settings.volume.toFixed(1)}</span>
          </div>
        </div>

        {/* 系统语音 */}
        {systemVoices.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] tracking-wider uppercase text-ash-gray-400 mb-3 font-medium">系統中文語音 ({systemVoices.length})</p>
            <p className="text-[10px] text-ash-gray-400 mb-2">⚠️ 語音由瀏覽器提供，不同系統差異較大</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {systemVoices.map(v => (
                <div key={v.name} className="text-[11px] px-2 py-1 bg-ash-gray-50 flex justify-between">
                  <span>{v.name}</span>
                  <span className="text-ash-gray-400">{v.lang}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 测试按钮 */}
        <div className="flex gap-2">
          <button onClick={handleTest} className="flex-1 flex items-center justify-center gap-2 bg-ash-black text-white text-xs tracking-wider uppercase py-3 font-bold hover:bg-ash-gray-800">
            <Volume2 className="h-3.5 w-3.5"/> 測試播報
          </button>
          <button onClick={() => playPreview(settings)} className="flex items-center justify-center gap-2 border border-ash-gray-200 text-xs tracking-wider uppercase px-5 py-3 font-bold hover:bg-ash-gray-50">
            <Play className="h-3.5 w-3.5"/> 測試鈴聲
          </button>
        </div>
      </div>
    </div>
  );
}
