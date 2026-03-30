"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AcademyProgressState {
  completed: Record<string, string[]>;
  _hasHydrated: boolean;
  markComplete: (courseSlug: string, lessonSlug: string) => void;
  markIncomplete: (courseSlug: string, lessonSlug: string) => void;
  isLessonComplete: (courseSlug: string, lessonSlug: string) => boolean;
  courseProgress: (
    courseSlug: string,
    totalLessons: number
  ) => { completed: number; percent: number };
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAcademyProgress = create<AcademyProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      _hasHydrated: false,

      markComplete: (courseSlug, lessonSlug) =>
        set((state) => {
          const current = state.completed[courseSlug] || [];
          if (current.includes(lessonSlug)) return state;
          return {
            completed: {
              ...state.completed,
              [courseSlug]: [...current, lessonSlug],
            },
          };
        }),

      markIncomplete: (courseSlug, lessonSlug) =>
        set((state) => {
          const current = state.completed[courseSlug] || [];
          return {
            completed: {
              ...state.completed,
              [courseSlug]: current.filter((s) => s !== lessonSlug),
            },
          };
        }),

      isLessonComplete: (courseSlug, lessonSlug) => {
        const current = get().completed[courseSlug] || [];
        return current.includes(lessonSlug);
      },

      courseProgress: (courseSlug, totalLessons) => {
        const current = get().completed[courseSlug] || [];
        const completed = current.length;
        const percent =
          totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
        return { completed, percent };
      },

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "gf-academy-progress",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
