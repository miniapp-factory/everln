'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from '@/components/share';
import { url } from '@/lib/metadata';

const SIZE = 4;
const EMPTY = 0;

function randomTile() {
  return Math.random() < 0.9 ? 2 : 4;
}

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    addRandomTile();
    addRandomTile();
  }, []);

  const addRandomTile = () => {
    const empty: [number, number][] = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === EMPTY) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = grid.map(row => row.slice());
    newGrid[r][c] = randomTile();
    setGrid(newGrid);
  };

  const move = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;
    let moved = false;
    let newGrid = grid.map(row => row.slice());
    let newScore = score;

    const slide = (line: number[]) => {
      const filtered = line.filter(v => v !== EMPTY);
      const merged: number[] = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          newScore += filtered[i] * 2;
          i += 2;
        } else {
          merged.push(filtered[i]);
          i += 1;
        }
      }
      while (merged.length < SIZE) merged.push(EMPTY);
      return merged;
    };

    for (let i = 0; i < SIZE; i++) {
      let line: number[];
      if (dir === 'left' || dir === 'right') {
        line = newGrid[i];
        if (dir === 'right') line = line.slice().reverse();
        const newLine = slide(line);
        if (dir === 'right') newLine.reverse();
        if (JSON.stringify(newLine) !== JSON.stringify(newGrid[i])) {
          moved = true;
          newGrid[i] = newLine;
        }
      } else {
        line = newGrid.map(row => row[i]);
        if (dir === 'down') line = line.slice().reverse();
        const newLine = slide(line);
        if (dir === 'down') newLine.reverse();
        for (let r = 0; r < SIZE; r++) {
          if (newLine[r] !== newGrid[r][i]) {
            moved = true;
            newGrid[r][i] = newLine[r];
          }
        }
      }
    }

    if (moved) {
      setGrid(newGrid);
      setScore(newScore);
      if (newGrid.flat().some(v => v === 2048)) setWon(true);
      addRandomTile();
      if (checkGameOver(newGrid)) setGameOver(true);
    }
  };

  const checkGameOver = (g: number[][]) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] === EMPTY) return false;
        if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return false;
        if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  };

  const handleKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        move('up');
        break;
      case 'ArrowDown':
        move('down');
        break;
      case 'ArrowLeft':
        move('left');
        break;
      case 'ArrowRight':
        move('right');
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [grid, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((v, i) => (
          <div
            key={i}
            className={`w-16 h-16 flex items-center justify-center rounded-md text-2xl font-bold ${
              v === 0 ? 'bg-gray-200' : 'bg-blue-300'
            }`}
          >
            {v !== 0 ? v : ''}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => move('up')}>
          <span className="sr-only">Up</span>
        </Button>
        <Button variant="outline" onClick={() => move('down')}>
          <span className="sr-only">Down</span>
        </Button>
        <Button variant="outline" onClick={() => move('left')}>
          <span className="sr-only">Left</span>
        </Button>
        <Button variant="outline" onClick={() => move('right')}>
          <span className="sr-only">Right</span>
        </Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold">Game Over</div>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
      {won && !gameOver && (
        <div className="text-2xl font-bold">You reached 2048!</div>
      )}
    </div>
  );
}
