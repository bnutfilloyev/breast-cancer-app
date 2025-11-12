import type { ReactNode } from "react";

import Image from "next/image";

type ImageViewerProps = {
  src: string;
  alt?: string;
  overlay?: ReactNode;
};

export function ImageViewer({ src, alt = "Analysis view", overlay }: ImageViewerProps) {
  const isRemote = /^https?:\/\//.test(src);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950/80 shadow-lg dark:border-slate-700">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={900}
        className="h-full w-full object-contain"
        unoptimized={isRemote}
        loading="eager"
        priority
      />
      {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
    </div>
  );
}
