import Image from "next/image";

type ProjectArtworkProps = {
  cover: string;
  index: number;
  title: string;
};

export function ProjectArtwork({
  cover,
  index,
  title,
}: ProjectArtworkProps) {
  if (!cover) {
    return (
      <div
        aria-hidden
        className={`tahoe-project-art tahoe-project-art-${(index % 4) + 1}`}
      />
    );
  }

  return (
    <div className="tahoe-project-art overflow-hidden">
      <Image
        alt={title}
        className="h-full w-full object-cover"
        height={675}
        sizes="(max-width: 768px) 100vw, 33vw"
        src={cover}
        width={1200}
      />
    </div>
  );
}
