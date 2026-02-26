"use client";

import { useState, useEffect } from "react";
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
const SP_SLOW = { stiffness: 22, damping: 16, mass: 1.8 };
const SP_MED = { stiffness: 50, damping: 18, mass: 1.0 };
const SP_FAST = { stiffness: 100, damping: 20, mass: 0.6 };
const SP_EYE = { stiffness: 180, damping: 18, mass: 0.4 };
const SP_SPRING = { type: "spring" as const, stiffness: 260, damping: 20 };

// ── Brand Colors ───────────────────────────────────────────────────────────────
const BRAND = {
  primary: "#2563eb",       // Blue-600
  primaryDark: "#1d4ed8",   // Blue-700
  primaryLight: "#3b82f6",  // Blue-500
  accent: "#0ea5e9",        // Sky-500
  accentLight: "#38bdf8",   // Sky-400
  glow: "#2563eb44",
  glowStrong: "#2563eb66",
};

// ── Cursor hook ────────────────────────────────────────────────────────────────
function useCursor() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return { rawX, rawY };
}

// ── Floating Particles ────────────────────────────────────────────────────────
function FloatingParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number; delay: number; shape: number; color: string }[]
  >([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
        shape: i % 4,
        color: ["#2563eb33", "#0ea5e9aa", "#38bdf855", "#1e3a5f66"][i % 4],
      }))
    );
  }, []);

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
            width: 3, height: 3, borderRadius: "50%", backgroundColor: BRAND.accentLight,
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
          d={`M2 ${size * 0.4} Q${size * 0.3} ${size * 0.1} ${size * 0.5} ${size * 0.4} Q${size * 0.7} ${size * 0.7} ${size - 2} ${size * 0.4}`}
          stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"
        />
      </svg>
    );
  }
  if (sad) {
    return (
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        <path d={`M2 ${size * 0.5} Q${size / 2} 2 ${size - 2} ${size * 0.5}`}
          stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
      <path d={`M2 2 Q${size / 2} ${size * 0.65} ${size - 2} 2`}
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

type CharProps = { rawX: MotionValue<number>; rawY: MotionValue<number>; mood: string; introReady: boolean };

// ── 💻 Coder ──────────────────────────────────────────────────────────────────
function CoderChar({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-7, 7]), SP_SLOW);
  const by = useSpring(useTransform(rawY, [-1, 1], [-5, 5]), SP_SLOW);
  const rz = useSpring(useTransform(rawX, [-1, 1], [-2, 2]), SP_SLOW);

  const isHiding = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking";
  const isSad = mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, rotateZ: rz, transformOrigin: "bottom center" }}
      initial={{ y: 90, opacity: 0, scale: 0.5 }}
      animate={introReady ? { y: 0, opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.15, ...SP_SPRING }}
      className="absolute bottom-0 left-[0px] z-30"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative" style={{ width: 110, height: 200 }}>
          {/* Chair */}
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 10, borderRadius: 5, backgroundColor: "#1e3a5f" }} />
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 6, height: 30, backgroundColor: "#1e3a5f" }} />

          {/* Body / hoodie */}
          <div style={{
            position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)",
            width: 78, height: 85, borderRadius: "16px 16px 8px 8px",
            background: `linear-gradient(160deg, ${BRAND.primaryDark}, ${BRAND.primary})`,
            zIndex: 2,
          }}>
            {/* Hoodie pocket */}
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", width: 32, height: 18, borderRadius: "0 0 8px 8px", border: `2px solid ${BRAND.primaryLight}`, borderTop: "none" }} />
            {/* Logo on chest */}
            <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "#fff", fontWeight: 900, letterSpacing: 1, background: BRAND.accentLight, borderRadius: 4, padding: "2px 5px" }}>{"</>"}</div>
          </div>

          {/* Left arm */}
          <motion.div
            animate={{ rotate: [0, -6, 0, 4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top center", position: "absolute", bottom: 78, left: 4, width: 14, height: 44, borderRadius: 7, background: BRAND.primary, zIndex: 3 }}
          >
            <div style={{ position: "absolute", bottom: -8, left: -2, width: 18, height: 14, borderRadius: "50%", backgroundColor: "#fde68a" }} />
          </motion.div>
          {/* Right arm — typing */}
          <motion.div
            animate={{ rotate: [0, 5, 0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            style={{ transformOrigin: "top center", position: "absolute", bottom: 78, right: 4, width: 14, height: 44, borderRadius: 7, background: BRAND.primary, zIndex: 3 }}
          >
            <div style={{ position: "absolute", bottom: -8, right: -2, width: 18, height: 14, borderRadius: "50%", backgroundColor: "#fde68a" }} />
          </motion.div>

          {/* Laptop */}
          <div style={{ position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)", zIndex: 5 }}>
            {/* Screen */}
            <div style={{ width: 90, height: 58, borderRadius: "6px 6px 0 0", backgroundColor: "#0f172a", border: `2px solid ${BRAND.accentLight}`, position: "relative", overflow: "hidden" }}>
              {/* Code lines */}
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  style={{ position: "absolute", top: 8 + i * 12, left: [8, 16, 10, 20][i], height: 5, width: [45, 32, 50, 28][i], borderRadius: 3, backgroundColor: [BRAND.accentLight, "#4ade80", BRAND.primaryLight, "#fbbf24"][i] }}
                />
              ))}
              {/* Cursor blink */}
              <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ position: "absolute", bottom: 8, left: 46, width: 2, height: 10, backgroundColor: "#e2e8f0" }} />
            </div>
            {/* Keyboard */}
            <div style={{ width: 96, height: 12, borderRadius: "0 0 4px 4px", backgroundColor: "#1e293b", border: `1px solid ${BRAND.accentLight}`, marginLeft: -3 }}>
              <div style={{ display: "flex", gap: 2, padding: "2px 4px", flexWrap: "wrap" }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
                  <div key={i} style={{ width: 5, height: 4, borderRadius: 1, backgroundColor: "#334155" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Head */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 68, height: 65, zIndex: 6 }}>
            {/* Hair */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 68, height: 28, borderRadius: "34px 34px 0 0", backgroundColor: "#1e3a5f" }} />
            {/* Side hair */}
            <div style={{ position: "absolute", top: 8, left: -2, width: 10, height: 22, borderRadius: "6px 0 0 8px", backgroundColor: "#1e3a5f" }} />
            <div style={{ position: "absolute", top: 8, right: -2, width: 10, height: 22, borderRadius: "0 6px 8px 0", backgroundColor: "#1e3a5f" }} />

            {/* Face */}
            <div style={{
              position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: 66, height: 52, borderRadius: "0 0 30px 30px",
              backgroundColor: "#fde68a",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              {/* Glasses */}
              <div style={{ display: "flex", gap: 4, alignItems: "center", zIndex: 2 }}>
                <div style={{ width: 20, height: 14, borderRadius: 6, border: "2px solid #1e40af", backgroundColor: "#dbeafe55", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isHiding ? <div style={{ width: 12, height: 2, backgroundColor: "#1e40af", borderRadius: 2 }} /> : <Eye rawX={rawX} rawY={rawY} size={11} pupilSize={5} white={false} />}
                </div>
                <div style={{ width: 4, height: 2, backgroundColor: "#1e40af" }} />
                <div style={{ width: 20, height: 14, borderRadius: 6, border: "2px solid #1e40af", backgroundColor: "#dbeafe55", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isHiding ? <div style={{ width: 12, height: 2, backgroundColor: "#1e40af", borderRadius: 2 }} /> : <Eye rawX={rawX} rawY={rawY} size={11} pupilSize={5} white={false} />}
                </div>
              </div>
              <Smile sad={isSad} worried={isWorried} size={13} color="#92400e" />
            </div>
          </div>

          {/* Floating code snippets */}
          {[0, 1].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 1 }}
              style={{ position: "absolute", top: [24, 50][i], left: [i === 0 ? -22 : 96][0], fontSize: 8, color: BRAND.accentLight, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}
            >
              {["{code}", "</>"][i]}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 🤖 AI Bot ─────────────────────────────────────────────────────────────────
function AIBotChar({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-10, 10]), SP_SLOW);
  const by = useSpring(useTransform(rawY, [-1, 1], [-7, 7]), SP_SLOW);
  const headTilt = useSpring(useTransform(rawX, [-1, 1], [-4, 4]), SP_MED);

  const isHiding = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking";
  const isSad = mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, transformOrigin: "bottom center", left: 95, zIndex: 15 }}
      initial={{ y: 110, opacity: 0, scale: 0.4 }}
      animate={introReady ? { y: 0, opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.3, ...SP_SPRING }}
      className="absolute bottom-0"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <div className="relative" style={{ width: 95, height: 190 }}>
          {/* Neck */}
          <div style={{ position: "absolute", bottom: 85, left: "50%", transform: "translateX(-50%)", width: 18, height: 20, backgroundColor: "#334155", zIndex: 3 }} />

          {/* Body */}
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: 82, height: 90, borderRadius: "14px 14px 10px 10px",
            background: `linear-gradient(160deg, #1e293b, #0f172a)`,
            border: `2px solid ${BRAND.primary}`,
            zIndex: 2,
          }}>
            {/* Circuit lines */}
            <svg width="78" height="86" viewBox="0 0 78 86" style={{ position: "absolute", top: 0, left: 0, opacity: 0.3 }}>
              <line x1="15" y1="20" x2="15" y2="50" stroke={BRAND.accentLight} strokeWidth="1" />
              <line x1="15" y1="35" x2="35" y2="35" stroke={BRAND.accentLight} strokeWidth="1" />
              <circle cx="35" cy="35" r="3" fill={BRAND.accentLight} />
              <line x1="60" y1="20" x2="60" y2="60" stroke={BRAND.primaryLight} strokeWidth="1" />
              <line x1="40" y1="60" x2="60" y2="60" stroke={BRAND.primaryLight} strokeWidth="1" />
              <circle cx="40" cy="60" r="3" fill={BRAND.primaryLight} />
            </svg>
            {/* Chest panel */}
            <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 44, height: 30, borderRadius: 8, backgroundColor: "#0f172a", border: `1px solid ${BRAND.accentLight}` }}>
              {[0, 1].map(i => (
                <motion.div key={i} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9 + i * 0.3, repeat: Infinity, delay: i * 0.4 }} style={{ margin: "4px 6px", height: 5, borderRadius: 3, background: i === 0 ? `linear-gradient(90deg,${BRAND.accentLight},${BRAND.primaryLight})` : `linear-gradient(90deg,#4ade80,#22c55e)` }} />
              ))}
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ margin: "3px auto", width: 10, height: 10, borderRadius: "50%", backgroundColor: BRAND.accentLight, boxShadow: `0 0 6px ${BRAND.accentLight}` }} />
            </div>
            {/* Side vents */}
            {[-1, 1].map(side => (
              <div key={side} style={{ position: "absolute", top: 55, [side === -1 ? "left" : "right"]: 6 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 3, borderRadius: 2, backgroundColor: "#334155", margin: "2px 0" }} />)}
              </div>
            ))}
          </div>

          {/* Arms */}
          {[-1, 1].map((side, idx) => (
            <motion.div
              key={idx}
              animate={{ rotate: [0, side * 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.6 }}
              style={{ transformOrigin: "top center", position: "absolute", bottom: 45, [side === -1 ? "left" : "right"]: -8, width: 16, height: 48, borderRadius: 8, background: "linear-gradient(180deg,#1e293b,#334155)", border: `1px solid ${BRAND.primary}`, zIndex: 1 }}
            >
              {/* Hand / gripper */}
              <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 20, height: 14, borderRadius: 7, backgroundColor: "#1e293b", border: `1px solid ${BRAND.primaryLight}` }} />
            </motion.div>
          ))}

          {/* Head */}
          <motion.div style={{ rotate: headTilt, transformOrigin: "bottom center", position: "absolute", top: 92, left: "50%", transform: "translateX(-50%)", zIndex: 8 }}>
            {/* Antenna */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 2 }}>
              <motion.div animate={{ scale: [1, 1.6, 1], backgroundColor: [BRAND.accentLight, "#fbbf24", BRAND.accentLight] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", boxShadow: `0 0 10px ${BRAND.accentLight}` }} />
              <div style={{ width: 3, height: 14, backgroundColor: "#475569" }} />
            </div>
            {/* Head box */}
            <div style={{
              width: 80, height: 65, borderRadius: 14,
              background: "linear-gradient(160deg,#1e293b,#0f172a)",
              border: `2px solid ${BRAND.primary}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
              position: "relative",
            }}>
              {/* Visor strip */}
              <div style={{ position: "absolute", top: 15, left: 4, right: 4, height: 24, borderRadius: 8, background: `linear-gradient(135deg,${BRAND.glow},${BRAND.primary}44)`, border: `1px solid ${BRAND.primaryLight}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                {isHiding ? (
                  <>
                    <div style={{ width: 14, height: 3, backgroundColor: BRAND.accentLight, borderRadius: 2 }} />
                    <div style={{ width: 14, height: 3, backgroundColor: BRAND.accentLight, borderRadius: 2 }} />
                  </>
                ) : (
                  <>
                    <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={8} white={true} />
                    <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={8} white={true} />
                  </>
                )}
              </div>
              {/* Mouth speaker */}
              <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 3 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div key={i} animate={{ scaleY: isHiding ? 1 : [0.5, 1.5, 0.8, 1.2, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} style={{ width: 3, height: isSad ? 2 : 8, borderRadius: 2, backgroundColor: BRAND.accentLight }} />
                ))}
              </div>
              {/* Side bolt */}
              <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)", width: 7, height: 7, borderRadius: "50%", backgroundColor: "#475569", border: "1px solid #64748b" }} />
              <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 7, height: 7, borderRadius: "50%", backgroundColor: "#475569", border: "1px solid #64748b" }} />
            </div>
          </motion.div>

          {/* Legs */}
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10 }}>
            {[0, 1].map(i => (
              <div key={i}>
                <div style={{ width: 24, height: 28, borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg,#1e293b,#0f172a)", border: `1px solid ${BRAND.primary}` }} />
                <div style={{ width: 28, height: 10, borderRadius: "0 0 6px 6px", backgroundColor: "#0f172a", border: `1px solid ${BRAND.primaryLight}`, marginLeft: -2 }} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── ☁️ Cloud Server ───────────────────────────────────────────────────────────
function CloudChar({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-14, 14]), SP_MED);
  const by = useSpring(useTransform(rawY, [-1, 1], [-9, 9]), SP_MED);
  const rz = useSpring(useTransform(rawX, [-1, 1], [3, -3]), SP_MED);

  const isHiding = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking";
  const isSad = mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, rotateZ: rz, transformOrigin: "bottom center", left: 195, zIndex: 20 }}
      initial={{ y: 80, opacity: 0, scale: 0.3 }}
      animate={introReady ? { y: 0, opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.45, ...SP_SPRING }}
      className="absolute bottom-0"
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <div className="relative" style={{ width: 110, height: 140 }}>
          {/* Data beams going down */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ height: [0, 30, 0], opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
              style={{ position: "absolute", bottom: -30, left: [28, 52, 76][i], width: 3, borderRadius: 2, backgroundColor: [BRAND.accentLight, BRAND.primaryLight, "#4ade80"][i], transformOrigin: "top" }}
            />
          ))}

          {/* Server rack body */}
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: 86, height: 80, borderRadius: "8px 8px 6px 6px",
            background: "linear-gradient(160deg,#1e293b,#0f172a)",
            border: `2px solid ${BRAND.primary}`,
            zIndex: 2,
          }}>
            {/* Server rack units */}
            {[0, 1, 2].map(i => (
              <div key={i} style={{ position: "absolute", top: 8 + i * 22, left: 6, right: 6, height: 16, borderRadius: 4, backgroundColor: "#0f172a", border: `1px solid ${BRAND.primaryLight}44`, display: "flex", alignItems: "center", paddingLeft: 6, gap: 4 }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1 + i * 0.2, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: ["#4ade80", BRAND.accentLight, "#fbbf24"][i] }} />
                <div style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: "#334155" }} />
                <div style={{ width: 12, height: 8, borderRadius: 2, backgroundColor: "#334155", marginRight: 4 }} />
              </div>
            ))}
          </div>

          {/* Cloud puff shape */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 110, height: 72, position: "absolute", top: 0 }}>
            {/* Big center puff */}
            <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 68, height: 58, borderRadius: "50%", background: `linear-gradient(135deg,${BRAND.primaryLight},${BRAND.primary})`, boxShadow: `0 0 20px ${BRAND.glow}` }} />
            {/* Left small puff */}
            <div style={{ position: "absolute", top: 26, left: 4, width: 46, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})` }} />
            {/* Right small puff */}
            <div style={{ position: "absolute", top: 22, right: 4, width: 50, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${BRAND.primaryLight},${BRAND.primary})` }} />
            {/* Face on the cloud */}
            <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", width: 68, height: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 5 }}>
              <div style={{ display: "flex", gap: 16 }}>
                {isHiding ? (
                  <>
                    <div style={{ width: 12, height: 3, backgroundColor: "#fff", borderRadius: 2 }} />
                    <div style={{ width: 12, height: 3, backgroundColor: "#fff", borderRadius: 2 }} />
                  </>
                ) : (
                  <>
                    <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={7} white={true} />
                    <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={7} white={true} />
                  </>
                )}
              </div>
              <Smile sad={isSad} worried={isWorried} size={13} color="#fff" />
            </div>

            {/* WiFi signal arcs */}
            <motion.div animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 2, repeat: Infinity }}>
              <svg style={{ position: "absolute", top: -14, right: 12 }} width="22" height="18" viewBox="0 0 22 18">
                <path d="M3 15 Q11 2 19 15" stroke={BRAND.accentLight} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                <path d="M6 15 Q11 6 16 15" stroke={BRAND.accentLight} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
                <circle cx="11" cy="15" r="2" fill={BRAND.accentLight} />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 🛡️ Security Shield ────────────────────────────────────────────────────────
function ShieldChar({ rawX, rawY, mood, introReady }: CharProps) {
  const bx = useSpring(useTransform(rawX, [-1, 1], [-20, 20]), SP_FAST);
  const by = useSpring(useTransform(rawY, [-1, 1], [-12, 12]), SP_FAST);
  const rz = useSpring(useTransform(rawX, [-1, 1], [-5, 5]), SP_MED);

  const isHiding = mood === "hiding";
  const isWorried = mood === "worried" || mood === "peeking";
  const isSad = mood === "sad";

  return (
    <motion.div
      style={{ x: bx, y: by, rotateZ: rz, transformOrigin: "bottom center", left: 292, zIndex: 25 }}
      initial={{ y: 70, opacity: 0, scale: 0.3, rotate: 15 }}
      animate={introReady ? { y: 0, opacity: 1, scale: 1, rotate: 0 } : {}}
      transition={{ delay: 0.6, ...SP_SPRING }}
      className="absolute bottom-0"
    >
      <motion.div
        animate={{ y: [0, -7, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className="relative" style={{ width: 95, height: 150 }}>
          {/* Shield body */}
          <svg width="95" height="140" viewBox="0 0 95 140" style={{ position: "absolute", top: 0, left: 0 }}>
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={BRAND.primary} />
                <stop offset="100%" stopColor={BRAND.primaryDark} />
              </linearGradient>
            </defs>
            {/* Outer shield */}
            <path d="M47 4 L88 20 L88 65 Q88 110 47 132 Q6 110 6 65 L6 20 Z" fill="url(#shieldGrad)" stroke={BRAND.accentLight} strokeWidth="2" />
            {/* Inner shield highlight */}
            <path d="M47 14 L80 26 L80 64 Q80 100 47 118 Q14 100 14 64 L14 26 Z" fill="none" stroke={BRAND.primaryLight} strokeWidth="1" opacity="0.4" />
          </svg>

          {/* Face on shield */}
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 76, height: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 14, gap: 8, zIndex: 5 }}>
            {/* Eyes */}
            <div style={{ display: "flex", gap: 16 }}>
              {isHiding ? (
                <>
                  <div style={{ width: 14, height: 3, backgroundColor: "#fff", borderRadius: 2 }} />
                  <div style={{ width: 14, height: 3, backgroundColor: "#fff", borderRadius: 2 }} />
                </>
              ) : (
                <>
                  <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={8} white={true} />
                  <Eye rawX={rawX} rawY={rawY} size={14} pupilSize={8} white={true} />
                </>
              )}
            </div>
            <Smile sad={isSad} worried={isWorried} size={14} color="#fff" />

            {/* Lock icon */}
            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 16, height: 10, borderRadius: "8px 8px 0 0", border: "2.5px solid #fff", borderBottom: "none" }} />
              <div style={{ width: 22, height: 14, borderRadius: 4, backgroundColor: "#fff22", background: "rgba(255,255,255,0.25)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#fff" }} />
              </div>
            </div>
          </div>

          {/* Orbiting security dots */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ rotate: [i * 120, i * 120 + 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", top: 30, left: "50%", width: 70, height: 70, marginLeft: -35, marginTop: -5 }}
            >
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, borderRadius: "50%", backgroundColor: [BRAND.accentLight, "#fbbf24", "#4ade80"][i], boxShadow: `0 0 8px ${[BRAND.accentLight, "#fbbf24", "#4ade80"][i]}` }}
              />
            </motion.div>
          ))}

          {/* Base / feet */}
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
            <div style={{ width: 22, height: 12, borderRadius: "4px 4px 0 0", backgroundColor: BRAND.primaryDark, border: `1px solid ${BRAND.primary}` }} />
            <div style={{ width: 22, height: 12, borderRadius: "4px 4px 0 0", backgroundColor: BRAND.primaryDark, border: `1px solid ${BRAND.primary}` }} />
          </div>
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
    <motion.div style={{ x: gx, y: gy, width: 420, height: 300 }} className="relative">
      <CoderChar rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
      <AIBotChar rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
      <CloudChar rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
      <ShieldChar rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
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
        style={{ background: `radial-gradient(circle, ${BRAND.glow} 0%, transparent 70%)`, filter: "blur(8px)" }}
      />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 C16 2 14.5 12 8 16 C14.5 20 16 30 16 30 C16 30 17.5 20 24 16 C17.5 12 16 2 16 2Z" fill="#111" />
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
          color: error ? "#ef4444" : focused ? BRAND.primary : "#9ca3af",
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
        style={{ paddingTop: "1.4rem", borderBottom: `2px solid ${error ? "#ef4444" : focused ? BRAND.primary : "#e5e7eb"}` }}
      />
      {/* Gradient underline sweep */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 origin-left"
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", height: 2, background: error ? "#ef4444" : `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.accent})`, transformOrigin: "left" }}
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
          color: error ? "#ef4444" : focused ? BRAND.primary : "#9ca3af",
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
        style={{ paddingTop: "1.4rem", paddingBottom: "0.375rem", borderBottom: `2px solid ${error ? "#ef4444" : focused ? BRAND.primary : "#e5e7eb"}` }}
      />
      <motion.div
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", position: "absolute", bottom: 0, left: 0, height: 2, background: error ? "#ef4444" : `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.accent})`, transformOrigin: "left" }}
      />
      <button type="button" onClick={onToggleVisible}
        className="absolute right-0 bottom-2 text-gray-400 hover:text-blue-600 transition-colors">
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
                <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
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
            backgroundColor: checked ? BRAND.primary : "#fff",
            borderColor: checked ? BRAND.primary : "#d1d5db",
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
                <path d="M1 4.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
        <span className="text-xs text-gray-500 select-none">Remember for 30 days</span>
      </button>
      <Link href="/forgot-password">
        <motion.button
          whileHover={{ color: BRAND.primary, x: 2 }}
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
      style={{ background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 50%, ${BRAND.accentLight} 100%)` }}
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
          <path d="M16 2 C16 2 14.5 12 8 16 C14.5 20 16 30 16 30 C16 30 17.5 20 24 16 C17.5 12 16 2 16 2Z" fill="white" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { rawX, rawY } = useCursor();

  const [introReady, setIntroReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mood, setMood] = useState("neutral");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(false);
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

      {/* Background ambient blobs — blue theme */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.14, 0.22, 0.14], x: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: BRAND.primary }} />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.09, 0.18, 0.09], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: BRAND.accent }} />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: BRAND.accentLight }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ minHeight: 560, boxShadow: `0 25px 80px -12px ${BRAND.glow}, 0 10px 40px -8px rgba(0,0,0,0.3)` }}
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
          style={{ background: "linear-gradient(180deg, #e8f0fe 0%, #dbeafe 100%)" }}
        >
          {/* Animated dot grid */}
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #2563eb15 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />

          {/* Floating particles */}
          <FloatingParticles />

          {/* Subtle gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: `linear-gradient(180deg, ${BRAND.glow} 0%, transparent 100%)` }} />

          <Illustration rawX={rawX} rawY={rawY} mood={mood} introReady={introReady} />
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-14 py-12 relative">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-[0.04] rounded-full"
            style={{ background: `radial-gradient(circle, ${BRAND.primary} 0%, transparent 70%)` }} />

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              width={120}
              height={40}
              alt="Murphys Technology Logo"
            />

          </motion.div>

          {/* Heading with gradient */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-9">
            <h1 className="text-[1.85rem] font-bold tracking-tight"
              style={{ background: `linear-gradient(135deg, #111 0%, ${BRAND.primary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
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
              onFocus={() => { }}
              onBlur={() => { }}
              visible={visible}
              onToggleVisible={() => setVisible(v => !v)}
              error={pwdError}
              delay={0.36}
            />

            <Checkbox checked={remember} onToggle={() => setRemember(r => !r)} delay={0.44} />

            {/* Log In — blue gradient button */}
            <motion.button
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.45 }}
              whileHover={{ scale: 1.025, boxShadow: `0 10px 40px ${BRAND.glow}` }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              type="button"
              className="w-full text-white py-4 rounded-2xl text-sm font-semibold tracking-wide relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, #0f172a 0%, ${BRAND.primary} 100%)` }}
            >
              <motion.div
                className="absolute inset-0 opacity-0"
                whileHover={{ opacity: 1 }}
                style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%)` }}
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
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="text-center text-xs text-gray-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register">
              <motion.button
                whileHover={{ color: BRAND.primary }}
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