"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Define the structure of each team entry. Each team has a name and a set of
// weights representing its odds for each draft pick. Additional metadata such
// as a human‑readable odds string and previous season record can also be
// attached. When adding your own teams ensure that the length of the
// `weights` arrays are all equal so that every team has odds for each pick.
interface Team {
  name: string;
  weights: number[];
  oddsText?: string;
  record?: string;
}

// Example pool of teams. The numbers in `weights` correspond to the odds of
// receiving each pick in the draft. Larger numbers increase the chance of
// being selected for that pick. These values are not true NBA odds, but
// illustrate how you can set different odds per pick for each team. Feel
// free to modify this array or build a UI around it to capture user input.
const defaultTeams: Team[] = [
  {
    name: "Dragons",
    weights: [250, 200, 150, 100, 50],
    oddsText: "1 in 4",
    record: "25‑57",
  },
  {
    name: "Sharks",
    weights: [200, 180, 160, 140, 120],
    oddsText: "1 in 5",
    record: "28‑54",
  },
  {
    name: "Wolves",
    weights: [150, 160, 170, 180, 190],
    oddsText: "1 in 6",
    record: "31‑51",
  },
  {
    name: "Bulls",
    weights: [100, 120, 140, 160, 180],
    oddsText: "1 in 8",
    record: "34‑48",
  },
  {
    name: "Eagles",
    weights: [50, 80, 110, 140, 170],
    oddsText: "1 in 10",
    record: "38‑44",
  },
];

export default function Page() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPick, setCurrentPick] = useState(0);
  const [remainingTeams, setRemainingTeams] = useState<Team[]>(defaultTeams);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [currentBall, setCurrentBall] = useState<Team | null>(null);

  const totalPicks = defaultTeams[0].weights.length;

  // Function to perform a weighted random draw for the current pick. It uses
  // only the weights at index `currentPick` from the remaining teams. Once a
  // team is selected it is removed from the pool and appended to the
  // `selectedTeams` list.
  const selectTeamForPick = () => {
    if (currentPick >= totalPicks || remainingTeams.length === 0) return;
    // Compute the cumulative weight for this pick across all remaining teams
    const weights = remainingTeams.map((t) => t.weights[currentPick]);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let r = Math.random() * totalWeight;
    let chosenIndex = 0;
    for (let i = 0; i < remainingTeams.length; i++) {
      r -= weights[i];
      if (r < 0) {
        chosenIndex = i;
        break;
      }
    }
    const team = remainingTeams[chosenIndex];
    setCurrentBall(team);
    // Remove from remaining and append to selected list
    setRemainingTeams((prev) => prev.filter((_, idx) => idx !== chosenIndex));
    setSelectedTeams((prev) => [...prev, team]);
  };

  // Trigger a draw after a delay when the lottery is running and no ball is
  // currently being displayed. This delay mimics the machine swirling before
  // a ping pong ball pops out.
  useEffect(() => {
    if (!isRunning) return;
    if (currentBall === null && currentPick < totalPicks) {
      const timer = setTimeout(() => {
        selectTeamForPick();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentBall, currentPick]);

  // After the ball has been displayed for a short period, reset the current
  // ball and increment the pick so the next draw can begin.
  useEffect(() => {
    if (currentBall !== null) {
      const timer = setTimeout(() => {
        setCurrentBall(null);
        setCurrentPick((p) => p + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentBall]);

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        Custom Draft Lottery
      </h1>
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-5xl">
        {/* Left side: Stage with commissioner and lottery machine */}
        <div className="relative flex-1 flex justify-center items-center">
          {/* Commissioner illustration */}
          <div className="hidden sm:block">
            <Image src="/commish.png" alt="Commissioner" width={400} height={400} />
          </div>
          {/* Rotating machine overlay */}
          <div className="absolute top-16 left-8 w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-blue-500 bg-white/80 shadow-inner animate-spin-slow flex justify-center items-center">
            {/* The swirling lines could be drawn here as children or with an SVG */}
            <svg viewBox="0 0 100 100" className="w-32 h-32 opacity-40">
              <circle cx="50" cy="50" r="30" stroke="#1e3a8a" strokeWidth="4" fill="none" strokeDasharray="47 15" strokeLinecap="round" />
            </svg>
          </div>
          {/* Animated ping pong ball popping out */}
          <AnimatePresence>
            {currentBall && (
              <motion.div
                key={currentBall.name}
                initial={{ y: 0, scale: 1, opacity: 0 }}
                animate={{ y: -160, scale: 2, opacity: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 1.2 }}
                className="absolute top-20 left-16 sm:top-24 sm:left-20 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full border-2 border-black flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg"
              >
                <span>{currentBall.name}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Right side: Controls and results */}
        <div className="flex flex-col gap-4 flex-1 max-w-md">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "Drawing..." : "Start Lottery"}
          </button>
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            {selectedTeams.length === 0 && (
              <p className="text-gray-500">No teams selected yet.</p>
            )}
            {selectedTeams.length > 0 && (
              <ol className="list-decimal list-inside space-y-1">
                {selectedTeams.map((team, idx) => (
                  <li
                    key={team.name}
                    className="flex justify-between items-center bg-blue-50 p-2 rounded"
                  >
                    <span>
                      {idx + 1}. {team.name}
                    </span>
                    {team.oddsText && (
                      <span className="text-xs text-gray-600">{team.oddsText}</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}