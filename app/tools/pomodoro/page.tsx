"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import {
  recordRecentTool,
  getPomodoroSettings,
  savePomodoroSettings,
  getPomodoroStats,
  recordPomodoroSession,
} from "@/core-lib/storage";
import type { PomodoroSettings, PomodoroStats } from "@/types";

const tool = getToolBySlug("pomodoro")!;

type Phase = "focus" | "short-break" | "long-break";

export default function PomodoroPage() {
  const [settings, setSettings] = useState<PomodoroSettings | null>(null);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    recordRecentTool(tool.slug);
    const s = getPomodoroSettings();
    setSettings(s);
    setSecondsLeft(s.focusMinutes * 60);
    setStats(getPomodoroStats());
  }, []);

  const phaseDuration = useCallback(
    (p: Phase, s: PomodoroSettings) => {
      if (p === "focus") return s.focusMinutes * 60;
      if (p === "short-break") return s.shortBreakMinutes * 60;
      return s.longBreakMinutes * 60;
    },
    []
  );

  const goToNextPhase = useCallback(() => {
    if (!settings) return;
    if (phase === "focus") {
      const updatedStats = recordPomodoroSession(settings.focusMinutes);
      setStats(updatedStats);
      const nextCompleted = sessionsCompleted + 1;
      setSessionsCompleted(nextCompleted);
      const nextPhase: Phase =
        nextCompleted % settings.sessionsBeforeLongBreak === 0 ? "long-break" : "short-break";
      setPhase(nextPhase);
      setSecondsLeft(phaseDuration(nextPhase, settings));
    } else {
      setPhase("focus");
      setSecondsLeft(phaseDuration("focus", settings));
    }
  }, [phase, sessionsCompleted, settings, phaseDuration]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          goToNextPhase();
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, goToNextPhase]);

  const updateSetting = (key: keyof PomodoroSettings, value: number) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    savePomodoroSettings(updated);
    if (!running && phase === "focus" && key === "focusMinutes") {
      setSecondsLeft(value * 60);
    }
  };

  const reset = () => {
    if (!settings) return;
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(phaseDuration("focus", settings));
  };

  const skip = () => {
    setRunning(false);
    goToNextPhase();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const phaseLabel = phase === "focus" ? "Focus" : phase === "short-break" ? "Short break" : "Long break";

  if (!settings) return null;

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <div className="card flex flex-col items-center gap-4 p-8 text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {phaseLabel}
          </span>
          <p className="text-6xl font-semibold tabular-nums text-ink-900">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className="btn-primary !px-6"
              aria-label={running ? "Pause timer" : "Start timer"}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </button>
            <button onClick={reset} className="btn-secondary" aria-label="Reset timer">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button onClick={skip} className="btn-secondary" aria-label="Skip to next phase">
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <ResultCard label="Sessions today" value={String(stats?.completedSessions ?? 0)} />
          <ResultCard label="Total focus minutes" value={String(stats?.totalFocusMinutes ?? 0)} />
        </div>

        <div className="mt-6 card p-4">
          <h2 className="text-sm font-semibold text-ink-800">Customize durations</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="focus-min">
                Focus (min)
              </label>
              <input
                id="focus-min"
                type="number"
                min={1}
                value={settings.focusMinutes}
                onChange={(e) => updateSetting("focusMinutes", Number(e.target.value) || 1)}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="short-break-min">
                Short break (min)
              </label>
              <input
                id="short-break-min"
                type="number"
                min={1}
                value={settings.shortBreakMinutes}
                onChange={(e) => updateSetting("shortBreakMinutes", Number(e.target.value) || 1)}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="long-break-min">
                Long break (min)
              </label>
              <input
                id="long-break-min"
                type="number"
                min={1}
                value={settings.longBreakMinutes}
                onChange={(e) => updateSetting("longBreakMinutes", Number(e.target.value) || 1)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "What happens after a focus session?",
                answer: "The timer automatically switches to a short break, and to a long break after the number of sessions you've set.",
              },
              {
                question: "Does the timer keep running if I close this tab?",
                answer: "No — the timer only runs while this page is open. Session counts completed so far are saved automatically.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
