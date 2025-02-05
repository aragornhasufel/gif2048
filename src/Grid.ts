import _ from "lodash";
import { GRID_SIZE, MAX_VALUE } from "./constants";

export interface Position {
  x: number;
  y: number;
}

export interface Tile extends Position {
  id: string;
  value: number;
  new: boolean;
}

export const addRandomTile = (tiles: Tile[]): Tile => {
  const emptyPositions = getEmptyPositions(tiles);
  const randomPosition =
    emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  return {
    id: crypto.randomUUID(),
    value: Math.random() <= 0.9 ? 1 : 2,
    new: true,
    ...randomPosition,
  };
};

const getEmptyPositions = (tiles: Tile[]) => {
  const emptyPositions: Position[] = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!tiles.some((tile) => tile.x === x && tile.y === y)) {
        emptyPositions.push({ x, y });
      }
    }
  }

  return emptyPositions;
};

const shiftLine = (line: Tile[], prop: "x" | "y", reverse = false) => {
  line = reverse ? line.reverse() : line;

  let lastMergedIndex = -1;
  let currIndex = reverse ? GRID_SIZE - 1 : 0;
  return line.forEach((tile, i) => {
    if (i > lastMergedIndex + 1 && tile.value === line[i - 1].value) {
      tile[prop] = line[i - 1][prop];
      lastMergedIndex = i;
    } else {
      tile[prop] = currIndex;
      currIndex = currIndex + (reverse ? -1 : 1);
    }
  });
};

export const move = (tilesOriginal: Tile[], direction: string) => {
  const tiles = _.cloneDeep(tilesOriginal);

  if (direction === "ArrowLeft" || direction === "ArrowRight") {
    for (let y = 0; y < GRID_SIZE; y++) {
      const line = tiles
        .filter((tile) => tile.y === y)
        .sort((a, b) => a.x - b.x);
      shiftLine(line, "x", direction === "ArrowRight");
    }
  } else if (direction === "ArrowUp" || direction === "ArrowDown") {
    for (let x = 0; x < GRID_SIZE; x++) {
      const line = tiles
        .filter((tile) => tile.x === x)
        .sort((a, b) => a.y - b.y);
      shiftLine(line, "y", direction === "ArrowDown");
    }
  }

  return tiles;
};

export const tilesChanged = (tiles1: Tile[], tiles2: Tile[]) => {
  return tiles1.some((tile) => {
    const org = tiles2.find((t) => t.id === tile.id);
    return org!.x !== tile.x || org!.y !== tile.y;
  });
};

export const mergeTiles = (tilesOriginal: Tile[]) => {
  const tiles = _.cloneDeep(tilesOriginal);

  for (const tile of tiles) {
    if (tile.value === 0) {
      continue;
    }
    const dup = tiles.find(
      (t) => t.x === tile.x && t.y === tile.y && t.id !== tile.id
    );
    if (dup) {
      tile.value += 1;
      tile.id = crypto.randomUUID();
      tile.new = true;
      dup.value = 0;
    }
  }

  return tiles.filter((x) => x.value > 0);
};

const findTile = (tiles: Tile[], x: number, y: number) =>
  tiles.find((t) => t.x === x && t.y === y);

export const hasValidMoves = (tiles: Tile[]) => {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const currentTile = findTile(tiles, x, y);
      if (!currentTile) {
        return true; // Found an empty tile
      }

      // Check adjacent tiles for mergeable pairs
      if (
        x < GRID_SIZE - 1 &&
        findTile(tiles, x + 1, y)?.value === currentTile.value
      ) {
        return true;
      }
      if (
        y < GRID_SIZE - 1 &&
        findTile(tiles, x, y + 1)?.value === currentTile.value
      ) {
        return true;
      }
    }
  }
  return false;
};

export const generatePreviewTiles = (top: number) => {
  if (top > MAX_VALUE) {
    top = MAX_VALUE;
  }
  const tiles: Tile[] = [];
  for (let i = 1; i <= top; i++) {
    const lastY = _.max(tiles.map((t) => t.y)) ?? -1;
    const lastX =
      _.max(tiles.filter((t) => t.y === lastY).map((t) => t.x)) ?? 0;
    const lastRowFull = lastY === -1 || lastX === GRID_SIZE - 1;
    tiles.push({
      id: `preview-${i}`,
      x: lastRowFull ? 0 : lastX + 1,
      y: lastRowFull ? lastY + 1 : lastY,
      value: i,
      new: i === top,
    });
  }
  return tiles;
};
