"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Radar,
  MessageSquareQuote,
  Network,
  Newspaper,
  Star,
  Briefcase,
  Lock,
} from "lucide-react";
import type { AcademyCourse } from "@/../content/academy/courses";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "graduation-cap": GraduationCap,
  radar: Radar,
  "message-square-quote": MessageSquareQuote,
  network: Network,
  newspaper: Newspaper,
  star: Star,
  briefcase: Briefcase,
};

interface CourseCardProps {
  course: AcademyCourse;
  progress: { completed: number; percent: number };
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const Icon = iconMap[course.icon] || GraduationCap;
  const totalLessons = course.lessons.length;

  const content = (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-card p-6 transition-all",
        course.available
          ? "hover:border-primary/50 hover:shadow-md cursor-pointer"
          : "opacity-60 cursor-default"
      )}
    >
      {!course.available && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Coming soon
          </span>
        </div>
      )}

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      <h3 className="mb-1 text-base font-semibold text-foreground">
        {course.title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
        {course.description}
      </p>

      <div className="mt-auto">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{totalLessons} lessons</span>
          {course.available && progress.percent > 0 && (
            <span>{progress.percent}% complete</span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${course.available ? progress.percent : 0}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (!course.available) return content;

  return (
    <Link href={`/dashboard/academy/${course.slug}`}>{content}</Link>
  );
}
