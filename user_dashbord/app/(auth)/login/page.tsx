"use client";

import { useState, useEffect, useMemo } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import AxiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ── Springs ────────────────────────────────────────────────────────────────────
const SP_SLOW   = { stiffness: 22, damping: 16, mass: 1.8 };
const SP_MED    = { stiffness: 50, damping: 18, mass: 1.0 };
const SP_FAST   = { stiffness: 100, damping: 20, mass: 0.6 };
const SP_EYE    = { stiffness: 180, damping: 18, mass: 0.4 };
const SP_SPRING = { type: "spring" as const, stiffness: 260, damping: 20 };

// ── Cursor hook ────────────────────────────────────────────────────────────────
function useCursor() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth  - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return { rawX, rawY };
}

// ── Floating Particles ────────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      shape: i % 4,
      color: ["#7c3aed33", "#f97316aa", "#facc1555", "#1f293766"][i % 4],
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.2, 0.7, 0.4, 0.8, 0.2],
            scale: [1, 1.3, 0.9, 1.1, 1],
            rotate: p.shape === 2 ? [0, 180, 360] : [0, 0, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.shape === 0 && (
            <div className="rounded-full" style={{ width: p.size, height: p.size, backgroundColor: p.color }} />
          )}
          {p.shape === 1 && (
            <svg width={p.size + 4} height={p.size + 4} viewBox="0 0 16 16">
              <path d="M8 1 L9.5 6 L15 6 L10.5 9.5 L12 15 L8 11.5 L4 15 L5.5 9.5 L1 6 L6.5 6 Z" fill={p.color} />
            </svg>
          )}
          {p.shape === 2 && (
            <div style={{ width: p.size, height: p.size, backgroundColor: p.color, transform: "rotate(45deg)" }} />
          )}
          {p.shape === 3 && (
            <div className="rounded-full" style={{ width: p.size * 0.6, height: p.size * 0.6, backgroundColor: p.color }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── Sparkle burst (on click) ──────────────────────────────────────────────────
function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, scale: 0 }}
      animate={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <motion.div
          key={deg}
          className="absolute"
          style={{
            width: 3, height: 3, borderRadius: "50%", backgroundColor: "#f59e0b",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos((deg * Math.PI) / 180) * 20,
            y: Math.sin((deg * Math.PI) / 180) * 20,
            opacity: 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

// ── Eye component — tracks cursor + blinks ────────────────────────────────────
function Eye({ rawX, rawY, size = 14, pupilSize = 7, white = true }: { rawX: MotionValue<number>; rawY: MotionValue<number>; size?: number; pupilSize?: number; white?: boolean }) {
  const ex = useSpring(useTransform(rawX, [-1, 1], [-2.5, 2.5]), SP_EYE);
  const ey = useSpring(useTransform(rawY, [-1, 1], [-1.8, 1.8]), SP_EYE);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const schedBlink = () => {
      const t = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        schedBlink();
      }, t);
    };
    schedBlink();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: blink ? size * 0.15 : size,
        backgroundColor: white ? "#fff" : "#1a1a1a",
        border: white ? "none" : "1.5px solid #fff",
        transition: "height 0.08s ease",
        borderRadius: "50%",
      }}
    >
      {!blink && (
        <motion.div
          style={{
            x: ex, y: ey,
            width: pupilSize, height: pupilSize,
            borderRadius: "50%",
            backgroundColor: white ? "#111" : "#fff",
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
}

// ── Mouth SVG helpers ─────────────────────────────────────────────────────────
function Smile({ sad = false, worried = false, size = 16, color = "#111" }) {
  if (worried) {
    return (
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <path
          d={`M2 ${size*0.4} Q${size*0.3} ${size*0.1} ${size*0.5} ${size*0.4} Q${size*0.7} ${size*0.7} ${size-2} ${size*0.4}`}
          stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"
        />
      </svg>
    );
  }
  if (sad) {
    return (
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size*0.7}`}>
        <path d={`M2 ${size*0.5} Q${size/2} 2 ${size-2} ${size*0.5}`}
          stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size*0.7}`}>
      <path d={`M2 2 Q${size/2} ${size*0.65} ${size-2} 2`}
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

type CharProps = { rawX: MotionValue<number>; rawY: MotionValue<number>; mood: string; introReady: boolean };

// ── Orange blob ───────────────────────────────────────────────────────────────
function OrangeBlob({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-6, 6]),  SP_SLOW);
  const by = useSpring(useTransform(rawY, [-1, 1], [-4, 4]),  SP_SLOW);
  const rz = useSpring(useTransform(rawX, [-1, 1], [-2, 2]), SP_SLOW);

  const isHiding  = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking";
  const isSad     = mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, rotateZ: rz, transformOrigin: "bottom center" }}
      initial={{ y: 80, opacity: 0 }}
      animate={introReady ? { y: 0, opacity: 1 } : {}}
      transition={{ delay: 0.2, ...SP_SPRING }}
      className="absolute bottom-0 left-0 z-30"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative" style={{ width: 200, height: 90 }}>
          <div className="absolute bottom-0 left-0 w-full bg-orange-500" style={{ height: 150, borderRadius: "100% 100% 0 0" }}>
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1.5">
              <div className="flex gap-3">
                {isHiding ? (
                  <>
                    <div style={{ width: 10, height: 5, borderRadius: "50% 50% 0 0", backgroundColor:"#111", borderBottom:"2px solid #111" }} />
                    <div style={{ width: 10, height: 5, borderRadius: "50% 50% 0 0", backgroundColor:"#111", borderBottom:"2px solid #111" }} />
                  </>
                ) : (
                  <>
                    <Eye rawX={rawX} rawY={rawY} size={11} pupilSize={6} />
                    <Eye rawX={rawX} rawY={rawY} size={11} pupilSize={6} />
                  </>
                )}
              </div>
              <Smile sad={isSad} worried={isWorried} size={14} color="#111" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Purple tall character ─────────────────────────────────────────────────────
function PurpleChar({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-12, 12]), SP_SLOW);
  const by = useSpring(useTransform(rawY, [-1, 1], [-8,  8]),  SP_SLOW);

  const baseRotate = mood === "hiding" ? -28
    : mood === "peeking" ? 12
    : mood === "sad"     ? -10
    : 0;
  const cursorRotate = useSpring(useTransform(rawX, [-1, 1], [-4, 4]), SP_SLOW);

  const isHiding  = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking";
  const isSad     = mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, transformOrigin: "bottom center", left: 80, zIndex: 10 }}
      initial={{ y: 120, opacity: 0, rotate: -30 }}
      animate={introReady ? { y: 0, opacity: 1, rotate: baseRotate } : {}}
      transition={{ delay: 0.35, ...SP_SPRING }}
      className="absolute bottom-0"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <motion.div
          style={{ rotate: cursorRotate, transformOrigin: "bottom center", width: 130, height: 300, position: "relative" }}
          className="relative flex flex-col items-center"
        >
          <div className="w-full h-full bg-violet-600 rounded-t-3xl absolute" />
          <div className="absolute top-10 left-0 right-0 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2.5">
              {isHiding ? (
                <>
                  <div style={{ width:13,height:6, borderRadius:"50% 50% 0 0", backgroundColor:"#fff", borderBottom:"2px solid #fff" }}/>
                  <div style={{ width:3, height:22, backgroundColor:"#fff", borderRadius:4, opacity:.8 }}/>
                  <div style={{ width:13,height:6, borderRadius:"50% 50% 0 0", backgroundColor:"#fff", borderBottom:"2px solid #fff" }}/>
                </>
              ) : (
                <>
                  <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={7} />
                  <div style={{ width:3, height:22, backgroundColor:"#fff", borderRadius:4, opacity:.8 }}/>
                  <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={7} />
                </>
              )}
            </div>
            <Smile sad={isSad || isHiding} worried={isWorried} size={16} color="#fff" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Dark rectangle character ──────────────────────────────────────────────────
function DarkChar({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-20, 20]), SP_MED);
  const by = useSpring(useTransform(rawY, [-1, 1], [-12, 12]), SP_MED);
  const rz = useSpring(useTransform(rawX, [-1, 1], [3, -3]),  SP_MED);

  const isHiding = mood === "hiding";

  return (
    <motion.div
      style={{ x: bx, y: by, rotateZ: rz, transformOrigin: "bottom center", left: 190, zIndex: 20 }}
      initial={{ y: 100, opacity: 0, rotate: 25 }}
      animate={introReady ? { y: 0, opacity: 1, rotate: 0 } : {}}
      transition={{ delay: 0.45, ...SP_SPRING }}
      className="absolute bottom-0"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="relative bg-gray-900 rounded-t-2xl flex flex-col items-center pt-6" style={{ width: 80, height: 250 }}>
          <div className="flex gap-3 mt-2">
            {isHiding ? (
              <>
                <div style={{ width:13, height:6, borderRadius:"50% 50% 0 0", backgroundColor:"#fff", borderBottom:"2px solid #fff" }}/>
                <div style={{ width:13, height:6, borderRadius:"50% 50% 0 0", backgroundColor:"#fff", borderBottom:"2px solid #fff" }}/>
              </>
            ) : (
              <>
                <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={7} />
                <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={7} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Yellow bird ───────────────────────────────────────────────────────────────
function YellowBird({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-28, 28]), SP_FAST);
  const by = useSpring(useTransform(rawY, [-1, 1], [-18, 18]), SP_FAST);
  const rz = useSpring(useTransform(rawX, [-1, 1], [-5, 5]),  SP_FAST);
  const beakX = useSpring(useTransform(rawX, [-1, 1], [-5, 5]), SP_FAST);

  const isHiding  = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking" || mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, rotateZ: rz, transformOrigin: "bottom left", left: 265, zIndex: 25 }}
      initial={{ x: 60, y: 60, opacity: 0, rotate: 15 }}
      animate={introReady ? { x: 0, y: 0, opacity: 1, rotate: 0 } : {}}
      transition={{ delay: 0.55, ...SP_SPRING }}
      className="absolute bottom-0"
    >
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className="relative bg-yellow-400 rounded-t-full" style={{ width: 110, height: 200 }}>
          <div className="absolute top-8 right-5">
            {isHiding ? (
              <div style={{ width:11, height:5, borderRadius:"50% 50% 0 0", backgroundColor:"#111", borderBottom:"2px solid #111" }}/>
            ) : (
              <Eye rawX={rawX} rawY={rawY} size={12} pupilSize={6} />
            )}
          </div>
          {isWorried && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <Smile worried size={12} color="#111" />
            </div>
          )}
          <motion.div
            animate={{ scaleY: [1, 0.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ x: beakX, width: 30, height: 7, top: "38%", right: -18, borderRadius: 4, transformOrigin: "left center" }}
            className="absolute bg-gray-900"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Full illustration panel ───────────────────────────────────────────────────
function Illustration({ rawX, rawY, mood, introReady }: CharProps) {
  const gx = useSpring(useTransform(rawX, [-1, 1], [-5, 5]), SP_SLOW);
  const gy = useSpring(useTransform(rawY, [-1, 1], [-3, 3]), SP_SLOW);

  return (
    <motion.div style={{ x: gx, y: gy, width: 400, height: 260 }} className="relative">
      <OrangeBlob  rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
      <PurpleChar  rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
      <DarkChar    rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
      <YellowBird  rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
    </motion.div>
  );
}

// ── 4-pointed star logo — animated glow ───────────────────────────────────────
function StarLogo() {
  return (
    <motion.div
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.4, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, #7c3aed44 0%, transparent 70%)", filter: "blur(8px)" }}
      />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 C16 2 14.5 12 8 16 C14.5 20 16 30 16 30 C16 30 17.5 20 24 16 C17.5 12 16 2 16 2Z" fill="#111"/>
      </svg>
    </motion.div>
  );
}

// ── Animated Input ────────────────────────────────────────────────────────────
type FloatingInputProps = {
  label: string; id: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void; onBlur?: () => void;
  error?: boolean; delay: number;
};

function FloatingInput({ label, id, type = "text", value, onChange, onFocus, onBlur, error, delay }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <label htmlFor={id}

        className="absolute left-0 pointer-events-none transition-all duration-200 font-medium"
        style={{
          top: active ? 0 : "0.85rem",
          fontSize: active ? "0.65rem" : "0.875rem",
          letterSpacing: active ? "0.1em" : "0",
          textTransform: active ? "uppercase" : "none",
          color: error ? "#ef4444" : focused ? "#7c3aed" : "#9ca3af",
        }}
      >
        {label}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={onChange}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        className="w-full bg-transparent text-gray-900 text-sm outline-none pb-1.5 pr-2"
        style={{ paddingTop: "1.4rem", borderBottom: `2px solid ${error ? "#ef4444" : focused ? "#7c3aed" : "#e5e7eb"}` }}
      />
      {/* Gradient underline sweep */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 origin-left"
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", height: 2, background: error ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #f97316)", transformOrigin: "left" }}
      />
    </motion.div>
  );
}

// ── Password field with peek ──────────────────────────────────────────────────
type PasswordFieldProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void; onBlur?: () => void;
  visible: boolean; onToggleVisible: () => void;
  error?: boolean; delay: number;
};

function PasswordField({ value, onChange, onFocus, onBlur, visible, onToggleVisible, error, delay }: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <label htmlFor="password"
        className="absolute left-0 pointer-events-none transition-all duration-200 font-medium"
        style={{
          top: active ? 0 : "0.85rem",
          fontSize: active ? "0.65rem" : "0.875rem",
          letterSpacing: active ? "0.1em" : "0",
          textTransform: active ? "uppercase" : "none",
          color: error ? "#ef4444" : focused ? "#7c3aed" : "#9ca3af",
        }}
      >
        Password
      </label>
      <input
        id="password" type={visible ? "text" : "password"} value={value}
        onChange={onChange}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        className="w-full bg-transparent text-gray-900 text-sm outline-none pr-10"
        style={{ paddingTop: "1.4rem", paddingBottom: "0.375rem", borderBottom: `2px solid ${error ? "#ef4444" : focused ? "#7c3aed" : "#e5e7eb"}` }}
      />
      <motion.div
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width:"100%", position:"absolute", bottom:0, left:0, height:2, background: error ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #f97316)", transformOrigin:"left" }}
      />
      <button type="button" onClick={onToggleVisible}
        className="absolute right-0 bottom-2 text-gray-400 hover:text-violet-600 transition-colors">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={visible ? "hide" : "show"}
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            {visible ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({ checked, onToggle, delay }: { checked: boolean; onToggle: () => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center justify-between"
    >
      <button type="button" onClick={onToggle} className="flex items-center gap-2">
        <motion.div
          animate={{
            backgroundColor: checked ? "#7c3aed" : "#fff",
            borderColor: checked ? "#7c3aed" : "#d1d5db",
            scale: checked ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
        >
          <AnimatePresence>
            {checked && (
              <motion.svg key="ck"
                initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 45 }}
                transition={SP_SPRING} width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 4.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
        <span className="text-xs text-gray-500 select-none">Remember for 30 days</span>
      </button>
      <Link href="/forgot-password">
        <motion.button
          whileHover={{ color: "#7c3aed", x: 2 }}
          type="button"
          className="text-xs text-gray-400 transition-colors cursor-pointer"
        >
          Forgot password?
        </motion.button>
      </Link>
    </motion.div>
  );
}

// ── Intro overlay (gradient flash + spinning logo) ─────────────────────────────
function IntroOverlay({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl"
      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #f97316 50%, #facc15 100%)" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 1.8, times: [0, 0.6, 1], ease: "easeInOut" }}
      onAnimationComplete={onDone}
    >
      <motion.div
        animate={{ rotate: [0, 360], scale: [0.4, 1.2, 0.9, 1] }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
          <path d="M16 2 C16 2 14.5 12 8 16 C14.5 20 16 30 16 30 C16 30 17.5 20 24 16 C17.5 12 16 2 16 2Z" fill="white"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { rawX, rawY } = useCursor();

  const [introReady, setIntroReady]   = useState(false);
  const [showIntro,  setShowIntro]    = useState(true);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [visible,  setVisible]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mood,     setMood]     = useState("neutral");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (password.length > 0 && !visible) {
      setMood("hiding");
    } else if (password.length > 0 && visible) {
      setMood("peeking");
    } else if (pwdError) {
      setMood("sad");
    } else {
      setMood("neutral");
    }
  }, [password, visible, pwdError]);

  const addSparkle = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const s = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top };
    setSparkles(prev => [...prev, s]);
    setTimeout(() => setSparkles(prev => prev.filter(sp => sp.id !== s.id)), 700);
  };

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async () => {
    setServerError("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      setMood("sad");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setMood("sad");
      return;
    }

    if (password.length < 4) {
      setPwdError(true);
      setMood("sad");
      return;
    }
    setPwdError(false);
    setLoading(true);
    try {
      const res = await AxiosInstance.post("/auth/login", {
        email,
        password,
        rememberMe: remember,
      }, { skipToast: true });

      const { token, refreshToken } = res.data;
      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      setMood("neutral");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setMood("sad");
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setServerError(
          (err as { response: { data: { message: string } } }).response.data.message
        );
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4 overflow-hidden relative">

      {/* Background ambient blobs — more dynamic */}
      <motion.div animate={{ scale:[1,1.15,1], opacity:[0.14,0.22,0.14], x: [0, 30, 0] }}
        transition={{ duration:9, repeat:Infinity, ease:"easeInOut" }}
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-700 rounded-full blur-3xl pointer-events-none"/>
      <motion.div animate={{ scale:[1,1.1,1], opacity:[0.09,0.18,0.09], x: [0, -20, 0] }}
        transition={{ duration:12, repeat:Infinity, ease:"easeInOut", delay:3 }}
        className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-orange-500 rounded-full blur-3xl pointer-events-none"/>
      <motion.div animate={{ scale:[1,1.2,1], opacity:[0.06,0.12,0.06] }}
        transition={{ duration:10, repeat:Infinity, ease:"easeInOut", delay:5 }}
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-400 rounded-full blur-3xl pointer-events-none"/>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ minHeight: 560, boxShadow: "0 25px 80px -12px rgba(124, 58, 237, 0.25), 0 10px 40px -8px rgba(0,0,0,0.3)" }}
        onClick={addSparkle}
      >
        {/* Sparkles on click */}
        {sparkles.map(s => <Sparkle key={s.id} x={s.x} y={s.y} />)}

        {/* Intro flash */}
        <AnimatePresence>
          {showIntro && (
            <IntroOverlay onDone={() => { setShowIntro(false); setIntroReady(true); }} />
          )}
        </AnimatePresence>

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex w-[46%] relative items-end justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #f5f0eb 0%, #ece5dd 100%)" }}
        >
          {/* Animated dot grid */}
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage:"radial-gradient(circle, #00000015 1px, transparent 1px)", backgroundSize:"24px 24px" }}
          />

          {/* Floating particles */}
          <FloatingParticles />

          {/* Subtle gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.06) 0%, transparent 100%)" }} />

          <Illustration rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-14 py-12 relative">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-[0.04] rounded-full"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />

          {/* Logo */}
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.1 }} className="flex justify-center mb-8">
            {/* <StarLogo /> */}
            <Image 
            src="/logo.png"
            width={120}
            height={40}
            alt="Logo"
          />

          </motion.div>

          {/* Heading with gradient */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2, duration:0.55, ease:[0.22,1,0.36,1] }}
            className="text-center mb-9">
            <h1 className="text-[1.85rem] font-bold tracking-tight"
              style={{ background: "linear-gradient(135deg, #111 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Welcome back!
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-400 mt-1.5"
            >
              Please enter your details
            </motion.p>
          </motion.div>

          {/* Form */}
          <div className="flex flex-col gap-7">

            <div>
              <FloatingInput
                label="Email" id="email" type="email" value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                onFocus={() => setMood("neutral")}
                onBlur={() => {
                  if (email.trim() && !isValidEmail(email)) {
                    setEmailError("Please enter a valid email address");
                  }
                }}
                delay={0.28}
              />
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-500 text-xs mt-1.5 ml-1"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <PasswordField
              value={password}
              onChange={e => { setPassword(e.target.value); setPwdError(false); }}
              onFocus={() => {}}
              onBlur={() => {}}
              visible={visible}
              onToggleVisible={() => setVisible(v => !v)}
              error={pwdError}
              delay={0.36}
            />

            <Checkbox checked={remember} onToggle={() => setRemember(r => !r)} delay={0.44} />

            {/* Log In — gradient button */}
            <motion.button
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.52, duration:0.45 }}
              whileHover={{ scale:1.025, boxShadow:"0 10px 40px rgba(124,58,237,0.35)" }}
              whileTap={{ scale:0.97 }}
              onClick={handleSubmit}
              type="button"
              className="w-full text-white py-4 rounded-2xl text-sm font-semibold tracking-wide relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1f2937 0%, #7c3aed 100%)" }}
            >
              <motion.div
                className="absolute inset-0 opacity-0"
                whileHover={{ opacity: 1 }}
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #f97316 100%)" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : "Log In"}
              </span>
            </motion.button>

            {/* Server error message */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full bg-red-50 border border-red-200 text-red-600 py-3 px-4 rounded-2xl text-sm font-medium flex items-center gap-2.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign up */}
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ delay:0.75 }}
            className="text-center text-xs text-gray-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register">
            <motion.button
              whileHover={{ color: "#7c3aed" }}
              type="button"
              className="text-gray-900 cursor-pointer font-semibold hover:underline underline-offset-2 transition-colors"
            >
              Sign Up
            </motion.button>
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
