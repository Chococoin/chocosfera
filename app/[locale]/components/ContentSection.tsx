interface ContentSectionProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
}

export default function ContentSection({
  title,
  description,
  imageSrc,
  imageAlt,
  imagePosition = 'left',
}: ContentSectionProps) {
  const flexDirection =
    imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse';

  return (
    <div className={`my-8 flex flex-col items-center gap-4 p-6 ${flexDirection}`}>
      <img
        alt={imageAlt}
        className="h-48 w-full rounded-lg object-cover md:h-64 md:w-1/2"
        src={imageSrc}
      />
      <div className={`md:w-1/2 ${imagePosition === 'left' ? 'md:pl-6' : 'md:pr-6'}`}>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
