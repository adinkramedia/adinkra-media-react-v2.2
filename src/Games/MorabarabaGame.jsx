// src/Games/MorabarabaGame.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ------------------- Board layout (24 points) ------------------- */
const positions = [
  [5, 5], [50, 5], [95, 5],
  [20, 20], [50, 20], [80, 20],
  [35, 35], [50, 35], [65, 35],
  [5, 50], [20, 50], [35, 50],
  [65, 50], [80, 50], [95, 50],
  [35, 65], [50, 65], [65, 65],
  [20, 80], [50, 80], [80, 80],
  [5, 95], [50, 95], [95, 95],
];

/* ------------------- South African mills (includes diagonals) ------------------- */
const mills = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17],
  [5, 13, 20], [2, 14, 23],
  // South African style diagonal mills (common variants)
  [0, 4, 8], [2, 4, 6],
  [21, 19, 17], [23, 19, 15],
  [9, 13, 17], [11, 13, 15],
];

/* ------------------- adjacency (includes diagonal adjacency where appropriate) ------------------- */
const adj = {
  0: [1, 9, 4], 1: [0, 2, 4], 2: [1, 14, 4],
  3: [4, 10], 4: [1, 3, 5, 7, 0, 2, 6, 8], 5: [4, 13],
  6: [7, 11, 4], 7: [4, 6, 8], 8: [7, 12, 4],
  9: [0, 10, 21, 13], 10: [3, 9, 11, 18], 11: [6, 10, 15, 13],
  12: [8, 13, 17], 13: [5, 12, 14, 20, 9, 11, 17, 15], 14: [2, 13, 23],
  15: [11, 16, 13, 23], 16: [15, 17, 19], 17: [12, 16, 13, 21],
  18: [10, 19], 19: [16, 18, 20, 22, 21, 23, 17, 15], 20: [13, 19],
  21: [9, 22, 19, 17], 22: [19, 21, 23], 23: [14, 22, 19, 15],
};

/* ------------------- helpers ------------------- */
const clone = (b) => b.slice();
const other = (p) => (p === "P1" ? "P2" : "P1");
const countPieces = (board, player) => board.filter((c) => c === player).length;
const isMill = (board, idx, player) =>
  mills.some((m) => m.includes(idx) && m.every((i) => board[i] === player));

function removablePieces(board, opponent) {
  const nonMills = [];
  const millsOnly = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === opponent) {
      if (!isMill(board, i, opponent)) nonMills.push(i);
      else millsOnly.push(i);
    }
  }
  return nonMills.length ? nonMills : millsOnly;
}

// check if player has any legal moves (used to detect stalemate)
function hasAnyMove(board, player) {
  const pieces = board
    .map((v, i) => (v === player ? i : null))
    .filter((x) => x !== null);
  if (pieces.length === 0) return false;
  if (pieces.length === 3) {
    // flying: if any empty spot exists, player can move
    return board.some((v) => v === null);
  }
  for (const pos of pieces) {
    const neighbors = adj[pos] || [];
    for (const n of neighbors) if (board[n] === null) return true;
  }
  return false;
}

/* ------------------- Component ------------------- */
export default function MorabarabaGame() {
  // Local 2-player focused (no AI in this file)
  const [board, setBoard] = useState(Array(24).fill(null)); // null | "P1" | "P2"
  const [turn, setTurn] = useState("P1");
  const [phase, setPhase] = useState("placing"); // placing | moving
  const [toPlace, setToPlace] = useState({ P1: 12, P2: 12 });
  const [selected, setSelected] = useState(null);
  const [removeFor, setRemoveFor] = useState(null); // which player must pick an opponent piece to remove
  const [winner, setWinner] = useState(null);

  // Run a safety check after state updates to detect end-of-game
  useEffect(() => {
    // Only check once if winner already set
    if (winner) return;

    // If both finished placing -> move to moving phase
    if (phase === "placing" && toPlace.P1 === 0 && toPlace.P2 === 0) {
      setPhase("moving");
      return;
    }

    // If moving phase, check piece counts and mobility
    if (phase === "moving") {
      const p1 = countPieces(board, "P1");
      const p2 = countPieces(board, "P2");
      if (p1 < 3) return setWinner("P2");
      if (p2 < 3) return setWinner("P1");

      // check mobility
      if (!hasAnyMove(board, "P1")) return setWinner("P2");
      if (!hasAnyMove(board, "P2")) return setWinner("P1");
    }
    // no immediate winner
  }, [board, phase, toPlace, winner]);

  // Reset everything
  function resetAll() {
    setBoard(Array(24).fill(null));
    setTurn("P1");
    setPhase("placing");
    setToPlace({ P1: 12, P2: 12 });
    setSelected(null);
    setRemoveFor(null);
    setWinner(null);
  }

  // Click handler
  function handleClick(idx) {
    if (winner) return;

    // If we are waiting for the player who formed a mill to remove an opponent piece:
    if (removeFor) {
      // Only the player who formed the mill (removeFor) should pick the opponent piece.
      if (turn !== removeFor) {
        // shouldn't happen (we purposely keep turn as the mill-maker), but safe-guard:
        return;
      }
      const opponent = other(removeFor);
      // must click an opponent piece
      if (board[idx] !== opponent) return;
      // must be a removable piece (prefer non-mill)
      const candidates = removablePieces(board, opponent);
      if (!candidates.includes(idx)) return;

      const nb = clone(board);
      nb[idx] = null;
      setBoard(nb);
      setRemoveFor(null);
      // after capture, hand turn to the opponent
      setTurn(opponent);
      return;
    }

    // Only allow moves when it's that player's turn (local PvP: both human)
    if (turn !== "P1" && turn !== "P2") return;

    // PLACING
    if (phase === "placing") {
      if (board[idx] !== null) return;
      if ((toPlace[turn] ?? 0) <= 0) return;

      const nb = clone(board);
      nb[idx] = turn;
      const nt = { ...toPlace, [turn]: toPlace[turn] - 1 };
      setBoard(nb);
      setToPlace(nt);

      // if mill formed -> same player chooses opponent piece to remove (do not change turn)
      if (isMill(nb, idx, turn)) {
        setRemoveFor(turn); // current player must choose which opponent piece to remove
        // If no removable pieces (edge), immediately pass turn:
        const opp = other(turn);
        const candidates = removablePieces(nb, opp);
        if (candidates.length === 0) {
          setRemoveFor(null);
          setTurn(opp);
        }
      } else {
        // normal turn pass
        setTurn(other(turn));
      }

      // If both done placing -> moving phase will be detected by effect and setPhase
      return;
    }

    // MOVING / FLYING
    if (phase === "moving") {
      // select piece
      if (selected === null) {
        if (board[idx] === turn) {
          setSelected(idx);
        }
        return;
      }

      // If a piece is selected and user clicks target
      if (board[idx] === null) {
        // validate move
        const playerCount = countPieces(board, turn);
        const canFly = playerCount === 3;
        const valid = canFly || (adj[selected] && adj[selected].includes(idx));
        if (!valid) {
          // invalid move - deselect
          setSelected(null);
          return;
        }

        // perform move
        const nb = clone(board);
        nb[selected] = null;
        nb[idx] = turn;
        setBoard(nb);
        setSelected(null);

        // if mill formed -> player must remove opponent piece (do not switch turn yet)
        if (isMill(nb, idx, turn)) {
          setRemoveFor(turn);
          const opp = other(turn);
          const candidates = removablePieces(nb, opp);
          if (candidates.length === 0) {
            // if no removable piece (edge), cancel removal and pass turn
            setRemoveFor(null);
            setTurn(opp);
          }
        } else {
          // normal end of turn
          setTurn(other(turn));
        }
        return;
      } else {
        // clicked an occupied spot -> (if it's own piece) switch selection, else deselect
        if (board[idx] === turn) {
          setSelected(idx);
        } else {
          setSelected(null);
        }
        return;
      }
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-adinkra-gold">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Link
            to="/games"
            className="inline-block bg-adinkra-card text-adinkra-highlight px-4 py-2 rounded-full border border-adinkra-highlight hover:bg-adinkra-highlight hover:text-black transition"
          >
            ← Back to Games
          </Link>
          <Link
            to="/news"
            className="inline-block bg-adinkra-card text-adinkra-highlight px-4 py-2 rounded-full border border-adinkra-highlight hover:bg-adinkra-highlight hover:text-black transition"
          >
            ← Back to News
          </Link>
        </div>

        <div className="flex gap-2">
          <button onClick={resetAll} className="px-3 py-1 bg-red-600 text-white rounded-full">
            Reset
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-adinkra-highlight text-center">Morabaraba — Local 2 Player (South African)</h1>

      {winner ? (
        <p className="text-center text-2xl font-bold text-green-400 mb-4">🎉 {winner} wins! Tap Reset to play again.</p>
      ) : (
        <p className="text-center mb-4">
          Phase: <strong>{phase}</strong> • Turn: <strong>{turn}</strong>
          {removeFor && ` • ${removeFor} remove an opponent piece`}
        </p>
      )}

      <p className="text-center mb-6">
        P1 pieces: {countPieces(board, "P1")} • P2 pieces: {countPieces(board, "P2")}
        <br />
        To place → P1: {toPlace.P1} &nbsp; P2: {toPlace.P2}
      </p>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-[90vw] max-w-[500px] h-[90vw] max-h-[500px] bg-adinkra-card rounded-2xl shadow-lg p-2 touch-none"
        >
          {/* board squares / lines */}
          <rect x="5" y="5" width="90" height="90" stroke="gold" fill="none" strokeWidth="2" />
          <rect x="20" y="20" width="60" height="60" stroke="gold" fill="none" strokeWidth="2" />
          <rect x="35" y="35" width="30" height="30" stroke="gold" fill="none" strokeWidth="2" />
          <line x1="50" y1="5" x2="50" y2="35" stroke="gold" strokeWidth="2" />
          <line x1="50" y1="65" x2="50" y2="95" stroke="gold" strokeWidth="2" />
          <line x1="5" y1="50" x2="35" y2="50" stroke="gold" strokeWidth="2" />
          <line x1="65" y1="50" x2="95" y2="50" stroke="gold" strokeWidth="2" />

          {/* diagonals (South African style) */}
          <line x1="5" y1="5" x2="95" y2="95" stroke="gold" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="95" y1="5" x2="5" y2="95" stroke="gold" strokeWidth="1" strokeDasharray="2 2" />

          {/* spots */}
          {positions.map(([x, y], idx) => {
            const occupant = board[idx];
            const sel = selected === idx;
            const strokeW = sel ? 2.4 : 1.4;
            const fill = occupant === "P1" ? "black" : occupant === "P2" ? "white" : "transparent";
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="3.8"
                fill={fill}
                stroke="gold"
                strokeWidth={strokeW}
                className="cursor-pointer hover:opacity-80"
                onClick={() => handleClick(idx)}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
