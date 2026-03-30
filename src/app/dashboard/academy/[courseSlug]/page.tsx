"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  GraduationCap,
  Radar,
  MessageSquareQuote,
  Network,
  Newspaper,
  Star,
  Briefcase,
} from "lucide-react";
import { getCourse } from "@/../content/academy/courses";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "graduation-cap": GraduationCap,
  radar: Radar,
  "message-square-quote": MessageSquareQuote,
  network: Network,
  newspaper: Newspaper,
  star: Star,
  briefcase: Briefcase,
};

export default function CourseOverviewPage() {
  const params = useParams<{ courseSlug: string }>();
  const course = getCourse(params.courseSlug);
  const { isLessonComplete, courseProgress, _hasHydrated } =
    useAcademyProgress();

  if (!course) return notFound();

  const Icon = iconMap[course.icon] || GraduationCap;
  const progress = _hasHydrated
    ? courseProgress(course.slug, course.lessons.length)
    : { completed: 0, percent: 0 };

  // Find first incomplete lesson for "Continue" button
  const firstIncomplete = course.lessons.find(
    (l) => !isLessonComplete(course.slug, l.slug)
  );
  const continueLesson = firstIncomplete || course.lessons[0];

  return (
    <div className="max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/academy"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Academy
      </Link>

      {/* Course header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {course.lessons.length} lessons
              {progress.percent > 0 && ` · ${progress.percent}% complete`}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {/* Progress bar */}
      {_hasHydrated && progress.percent > 0 && (
        <div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Continue / Start button */}
      <div>
        <Link
          href={`/dashboard/academy/${course.slug}/${continueLesson.slug}`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {progress.completed > 0 ? "Continue Learning" : "Start Course"}
        </Link>
      </div>

      {/* Lesson list */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <div className="divide-y divide-border rounded-lg border border-border">
          {course.lessons.map((lesson, idx) => {
            const complete =
              _hasHydrated && isLessonComplete(course.slug, lesson.slug);

            return (
              <Link
                key={lesson.slug}
                href={`/dashboard/academy/${course.slug}/${lesson.slug}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {/* Status indicator */}
                {complete ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium text-muted-foreground">
                      {idx + 1}
                    </span>
                  </div>
                )}

                {/* Lesson info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      complete ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lesson.description}
                  </p>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedMinutes} min
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
