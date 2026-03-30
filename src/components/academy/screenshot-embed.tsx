import Image from "next/image";

interface ScreenshotEmbedProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ScreenshotEmbed({ src, alt, caption }: ScreenshotEmbedProps) {
  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-lg border border-border">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={675}
          className="w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
