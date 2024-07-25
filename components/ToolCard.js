import Image from 'next/image';
import Link from 'next/link';

export default function ToolCard({ icon, title, description, isNew, url }) {
  return (
    <Link href={url} className="block w-full">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-[120px] relative w-full cursor-pointer hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-2">
          <div className="bg-purple-100 p-2 rounded-md mr-3">
            <Image src={icon} alt={title} width={24} height={24} />
          </div>
          <h3 className="font-semibold text-base text-gray-800">{title}</h3>
        </div>
        <div>
        <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
}