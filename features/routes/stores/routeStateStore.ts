import type {
  Feature,
  LineString,
  Point,
} from "@maplibre/maplibre-gl-directions";
import { createStore } from "zustand/vanilla";

// ルートの状態を表す型
export interface RouteState {
  waypoints: Feature<Point>[];
  snappoints: Feature<Point>[];
  routelines: Feature<LineString>[][];
}

// 履歴管理用の型
interface RouteHistory {
  past: RouteState[];
  present: RouteState;
  future: RouteState[];
}

// 空の初期状態
const EMPTY_STATE: RouteState = {
  waypoints: [],
  snappoints: [],
  routelines: [],
};

const STORAGE_KEY = "route-planner-state";

export type RouteSateActions = {
  pushState: (newState: Partial<RouteState>) => void;
  undo: () => RouteState | null;
  redo: () => RouteState | null;
  clear: () => void;
  initialize: (initialState: RouteState) => void;
};

export type RouteStateComputed = {
  canUndo: boolean;
  canRedo: boolean;
};

export type RouteStateStore = RouteHistory & RouteSateActions;

export const defaultInitState: RouteHistory = {
  past: [],
  present: EMPTY_STATE,
  future: [],
};

export const routeStateStore = (initState: RouteHistory = defaultInitState) => {
  return createStore<RouteStateStore>()((set, get) => ({
    ...initState,
    pushState: (newState) =>
      set((state) => {
        const updatedState = {
          ...state.present,
          ...newState,
        };
        const newPast = [...state.past, state.present].slice(-50); // 履歴は最大50件まで
        // 同じ状態なら履歴に追加しない
        if (JSON.stringify(state.present) === JSON.stringify(updatedState)) {
          return state; // 変更なしなら何もせずに現在の状態を返す
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState)); // localStorageに保存
        return {
          past: newPast,
          present: updatedState,
          future: [], // 新しい状態を追加したら未来の履歴はクリア
        };
      }),
    undo: () => {
      const state = get();
      const previous = state.past[state.past.length - 1];
      if (!previous) return null; // 戻る履歴がない場合
      const newPast = state.past.slice(0, -1);
      const newFuture = [state.present, ...state.future].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
      set({
        past: newPast,
        present: previous,
        future: newFuture,
      });
      return previous;
    },
    redo: () => {
      const state = get();
      const next = state.future[0];
      if (!next) return null; // 進む履歴がない場合
      const newFuture = state.future.slice(1);
      const newPast = [...state.past, state.present].slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      set({
        past: newPast,
        present: next,
        future: newFuture,
      });
      return next;
    },
    clear: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        past: [],
        present: EMPTY_STATE,
        future: [],
      });
    },
    initialize: (initialState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      set({
        past: [],
        present: initialState,
        future: [],
      });
    },
  }));
};
