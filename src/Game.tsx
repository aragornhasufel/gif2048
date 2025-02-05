// src/Game.tsx
import _, { lte, set } from "lodash";
import React, { useState, useEffect } from "react";
import TileElement from "./Tile";
import {
  addRandomTile,
  move,
  hasValidMoves,
  Tile,
  mergeTiles,
  tilesChanged,
  generatePreviewTiles,
} from "./Grid";
import { TRANSITION_TIME, GRID_SIZE } from "./constants";

const Game: React.FC<{ sources: string[] }> = ({ sources }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showTopTile, setShowTopTile] = useState<boolean>(false);

  const resetGame = (): void => {
    let newTiles = [addRandomTile([])];
    newTiles = [...newTiles, addRandomTile(newTiles)];
    setTiles(newTiles);
    setIsGameOver(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [tiles, showTopTile, isTransitioning, isGameOver]);

  const topTile = _.max(tiles.map((t) => t.value)) || 0;

  useEffect(() => {
    if (tiles.some((t) => t.new)) {
      setTimeout(() => {
        setTiles((tiles) => tiles.map((t) => ({ ...t, new: false })));
      }, 50);
    }
  }, [tiles]);

  const handleKeyPress = (event: KeyboardEvent): void => {
    if (event.shiftKey && event.key === "Z") {
      window.location.href = "/";
    } else if (event.shiftKey && event.key === "C") {
      setTiles((tiles) => tiles.filter((t) => t.value === topTile));
    }
    if (isGameOver || isTransitioning) return;

    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(event.key) >
      -1
    ) {
      setIsTransitioning(true);
      let moved = false;

      setTiles((tiles) => {
        const movedTiles = move(tiles, event.key);
        moved = tilesChanged(tiles, movedTiles);
        return movedTiles;
      });

      setTimeout(() => {
        setIsTransitioning(false);
        if (moved) {
          setTiles((tiles) => {
            const newTiles = mergeTiles(tiles);
            return [...newTiles, addRandomTile(newTiles)];
          });
        }
      }, TRANSITION_TIME);
    } else if (event.key === "Tab") {
      setShowTopTile(!showTopTile);
      event.preventDefault();
    } else if (event.shiftKey && event.key === "X") {
      setTiles(generatePreviewTiles(topTile + 1));
    } else if (event.shiftKey && event.key === "R") {
      resetGame();
    }

    setIsGameOver(!hasValidMoves(tiles));
  };

  return (
    <div id="app" className={showTopTile ? "show-top-tile" : ""}>
      <video
        className="top-tile-video"
        src={sources[topTile - 1]}
        autoPlay
        loop
        muted
      />
      <div id="game-grid">
        {Array(GRID_SIZE * GRID_SIZE)
          .fill(1)
          .map((_, i) => {
            return <div key={i} className="tile empty"></div>;
          })}
        {tiles.map((tile) => (
          <TileElement key={tile.id} tile={tile} sources={sources} />
        ))}
      </div>
      {isGameOver && <div>Game Over!</div>}

      <div id="preload" style={{ display: "none" }}>
        {sources.map((src, i) => (
          <video key={i} src={src} />
        ))}
      </div>
    </div>
  );
};

export default Game;
