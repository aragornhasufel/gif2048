// src/Tile.tsx
import React from "react";
import { Tile } from "./Grid";
import { TRANSITION_TIME } from "./constants";

interface TileProps {
  tile: Tile;
  sources: string[];
}

const TileElement: React.FC<TileProps> = ({ tile, sources }) => {
  const getPositionStyle = (pos: number) =>
    `calc(${pos * 25}% + ${pos * 2.5}px`;

  return (
    <div
      className={`tile positioned ${tile.new ? "new" : ""}`}
      style={{
        left: getPositionStyle(tile.x),
        top: getPositionStyle(tile.y),
        transition: `all ${TRANSITION_TIME}ms ease`,
      }}
    >
      <video src={sources[tile.value - 1]} autoPlay loop muted />
      <p className="number">{Math.pow(2, tile.value)}</p>
    </div>
  );
};

export default TileElement;
