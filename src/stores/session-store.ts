import { create } from "zustand";

interface SessionState {
  sessionId: string | null;
  confidence: number | null;
  setSession: (sessionId: string) => void;
  setConfidence: (confidence: number) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  confidence: null,
} as const;

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,
  setSession: (sessionId) => set({ sessionId }),
  setConfidence: (confidence) => set({ confidence }),
  reset: () => set(initialState),
}));
