import type {
  Feature,
  LineString,
  Point,
} from "@maplibre/maplibre-gl-directions";
import { createStore } from "zustand/vanilla";

export interface RouteState {
  waypoints: Feature<Point>[];
  snappoints: Feature<Point>[];
  routelines: Feature<LineString>[][];
}

interface RouteHistory {
  past: RouteState[];
  present: RouteState;
  future: RouteState[];
}

const STORAGE_KEY = "route-planner-state";

// 毎回新しい空を作る（参照共有しない）
const createEmptyState = (): RouteState => ({
  waypoints: [],
  snappoints: [],
  routelines: [],
});

// ディープコピーして参照共有しない新しいオブジェクトを作る
const cloneState = (s: RouteState): RouteState => structuredClone(s);

// localStorage 安全ラッパ
const savePresent = (s: RouteState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
};

// “同一判定” は一旦軽めに：参照が同じなら同じ、配列長が同じ＆座標が同じ等にすると更に良い
const isSameState = (a: RouteState, b: RouteState) => {
  // 最低限：参照が同じなら同じ
  if (a === b) return true;
  // 暫定：JSON（重いので後で最適化推奨）
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

export type RouteStateActions = {
  pushState: (newState: Partial<RouteState>) => void;
  undo: () => RouteState | null;
  redo: () => RouteState | null;
  clear: () => void;
  initialize: (initialState: RouteState) => void;
};

export type RouteStateStore = RouteHistory & RouteStateActions;

export const defaultInitState: RouteHistory = {
  past: [],
  present: createEmptyState(),
  future: [],
};

export const routeStateStore = (initState: RouteHistory = defaultInitState) => {
  return createStore<RouteStateStore>()((set, get) => ({
    ...initState,
    pushState: (newState) =>
      set((state) => {
        // 更新後present（ここで参照は new object になる）
        const updatedState: RouteState = { ...state.present, ...newState };

        // 同じなら何もしない（pastも増やさない）
        if (isSameState(state.present, updatedState)) return state;

        // 履歴に積むのは“クローン”
        const newPast = [...state.past, cloneState(state.present)].slice(-50);

        savePresent(updatedState);

        return {
          past: newPast,
          present: updatedState,
          future: [],
        };
      }),
    undo: () => {
      const state = get();
      const previous = state.past[state.past.length - 1];
      if (!previous) return null;
      const newPast = state.past.slice(0, -1);
      const newFuture = [cloneState(state.present), ...state.future].slice(
        0,
        50
      );
      savePresent(previous);
      // presentに入れる previous も、外部が触る可能性があるならclone推奨
      set({
        past: newPast,
        present: cloneState(previous),
        future: newFuture,
      });

      return previous;
    },

    redo: () => {
      const state = get();
      const next = state.future[0];
      if (!next) return null;

      const newFuture = state.future.slice(1);

      const newPast = [...state.past, cloneState(state.present)].slice(-50);

      savePresent(next);

      set({
        past: newPast,
        present: cloneState(next),
        future: newFuture,
      });

      return next;
    },
    clear: () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
      set({
        past: [],
        present: createEmptyState(),
        future: [],
      });
    },
    initialize: (initialState) => {
      savePresent(initialState);
      set({
        past: [],
        present: cloneState(initialState),
        future: [],
      });
    },
  }));
};
