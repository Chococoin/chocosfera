import Image from 'next/image';

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
      <div className="h-48 w-full overflow-hidden rounded-lg md:h-64 md:w-1/2">
        <Image
          alt={imageAlt}
          className="h-full w-full object-cover"
          src={imageSrc}
          width={800}
          height={600}
        />
      </div>
      <div className={`md:w-1/2 ${imagePosition === 'left' ? 'md:pl-6' : 'md:pr-6'}`}>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
