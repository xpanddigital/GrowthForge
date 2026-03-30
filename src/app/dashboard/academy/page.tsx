"use client";

import { GraduationCap } from "lucide-react";
import { courses } from "@/../content/academy/courses";
import { CourseCard } from "@/components/academy/course-card";
import { useAcademyProgress } from "@/hooks/use-academy-progress";

export default function AcademyPage() {
  const { courseProgress, _hasHydrated } = useAcademyProgress();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            MentionLayer Academy
          </h1>
        </div>
        <p className="text-muted-foreground">
          Master AI visibility — from fundamentals to advanced strategies.
        </p>
      </div>

      {/* Course grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.slug}
            course={course}
            progress={
              _hasHydrated
                ? courseProgress(course.slug, course.lessons.length)
                : { completed: 0, percent: 0 }
            }
          />
        ))}
      </div>
    </div>
  );
}
