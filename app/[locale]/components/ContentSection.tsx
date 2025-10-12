import Image from 'next/image';

interface ContentSectionProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export default function ContentSection({
  title,
  description,
  imageSrc,
  imageAlt,
}: ContentSectionProps) {
  return (
    <article className="content-card">
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={640}
          height={420}
          className="h-48 w-full object-cover sm:h-56"
        />
      </div>
      <div className="grid gap-3">
        <h3 className="content-card__title">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </article>
  );
}
