import type {
  Feature,
  LineString,
  Point,
} from "@maplibre/maplibre-gl-directions";
import { useCallback, useEffect, useRef, useState } from "react";

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
const MAX_HISTORY_LENGTH = 50;

/**
 * ルート状態の永続化とundo/redo履歴を管理するhook
 */
export function useRouteState() {
  const [history, setHistory] = useState<RouteHistory>(() => {
    console.log("Restoring route state from localStorage...");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RouteState;
        if (parsed.waypoints?.length > 0) {
          return { past: [], present: parsed, future: [] };
        }
      }
    } catch (e) {
      console.warn("Failed to restore route state:", e);
    }
    return { past: [], present: EMPTY_STATE, future: [] };
  });

  // localStorageから復元した場合は最初の保存をスキップ
  const isRestoringRef = useRef(history.present.waypoints.length > 0);

  // localStorageに保存
  useEffect(() => {
    // 復元中は保存しない
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }
    console.log("Saving route state to localStorage...");
    try {
      if (history.present.waypoints.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.present));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to save route state:", e);
    }
  }, [history.present]);

  // 現在の状態を更新（履歴に追加）
  const pushState = useCallback((newState: Partial<RouteState>) => {
    setHistory((prev) => {
      const updatedPresent = { ...prev.present, ...newState };
      // 同じ状態なら履歴に追加しない
      if (JSON.stringify(prev.present) === JSON.stringify(updatedPresent)) {
        return prev;
      }
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_LENGTH);
      return {
        past: newPast,
        present: updatedPresent,
        future: [], // 新しい状態を追加したらfutureはクリア
      };
    });
  }, []);

  // 現在の状態を更新（履歴に追加しない）
  const updateState = useCallback((newState: Partial<RouteState>) => {
    setHistory((prev) => ({
      ...prev,
      present: { ...prev.present, ...newState },
    }));
  }, []);

  // Undo - returns the new state for immediate use
  const undo = useCallback((): RouteState | null => {
    let newState: RouteState | null = null;
    setHistory((prev) => {
      const lastPast = prev.past[prev.past.length - 1];
      if (prev.past.length === 0 || !lastPast) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = lastPast;
      const newFuture = [prev.present, ...prev.future];

      newState = newPresent;
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
    return newState;
  }, []);

  // Redo - returns the new state for immediate use
  const redo = useCallback((): RouteState | null => {
    let newState: RouteState | null = null;
    setHistory((prev) => {
      const firstFuture = prev.future[0];
      if (prev.future.length === 0 || !firstFuture) return prev;

      const newFuture = prev.future.slice(1);
      const newPresent = firstFuture;
      const newPast = [...prev.past, prev.present];

      newState = newPresent;
      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
    return newState;
  }, []);

  // クリア
  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: EMPTY_STATE,
      future: [],
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 外部データで初期化（編集モード用）
  const initialize = useCallback((state: RouteState) => {
    isRestoringRef.current = true;
    setHistory({
      past: [],
      present: state,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    pushState,
    updateState,
    undo,
    redo,
    clear,
    initialize,
  };
}
