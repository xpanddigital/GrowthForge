import type { MDXComponents } from "mdx/types";
import { CalloutBox } from "./callout-box";
import { ScreenshotEmbed } from "./screenshot-embed";
import { ModuleLinkButton } from "./module-link-button";
import { VideoEmbed } from "./video-embed";
import { KeyTakeawayBox } from "./key-takeaway-box";

export const academyMdxComponents: MDXComponents = {
  // Custom components
  Callout: CalloutBox,
  Screenshot: ScreenshotEmbed,
  ModuleLink: ModuleLinkButton,
  VideoEmbed: VideoEmbed,
  KeyTakeaway: KeyTakeawayBox,

  // Styled HTML elements
  h1: ({ children }) => (
    <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-border pl-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2 text-muted-foreground">
      {children}
    </td>
  ),
};
