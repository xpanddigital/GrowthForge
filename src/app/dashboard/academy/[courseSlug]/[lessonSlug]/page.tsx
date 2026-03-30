import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { getLesson, getNextLesson, getPrevLesson } from "@/../content/academy/courses";
import { academyMdxComponents } from "@/components/academy/mdx-components";
import { LessonClientShell } from "./lesson-client-shell";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;

  const result = getLesson(courseSlug, lessonSlug);
  if (!result) return notFound();

  const { course, lesson } = result;

  // Read MDX file
  const mdxPath = path.join(
    process.cwd(),
    "content",
    "academy",
    courseSlug,
    `${lessonSlug}.mdx`
  );

  let mdxSource: string;
  try {
    mdxSource = fs.readFileSync(mdxPath, "utf-8");
  } catch {
    return notFound();
  }

  // Compile MDX
  const { content } = await compileMDX({
    source: mdxSource,
    components: academyMdxComponents,
  });

  const nextLesson = getNextLesson(courseSlug, lessonSlug);
  const prevLesson = getPrevLesson(courseSlug, lessonSlug);

  return (
    <LessonClientShell
      course={course}
      lessonSlug={lessonSlug}
      estimatedMinutes={lesson.estimatedMinutes}
      nextLesson={nextLesson}
      prevLesson={prevLesson}
    >
      {content}
    </LessonClientShell>
  );
}
