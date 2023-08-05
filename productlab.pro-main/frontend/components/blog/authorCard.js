import { PhotographIcon } from "@heroicons/react/outline";
import Image from "next/image";
import Link from "next/link";

export default function AuthorCard({ author, performer }) {
  return (
    <div className="px-8 py-8 mt-3 text-gray-500 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
      <div className="flex flex-wrap items-start sm:space-x-6 sm:flex-nowrap">
        <div className="relative flex-shrink-0 w-24 h-24 mt-1 ">
          {author.profile_pic ? (
            <Image className="rounded-full object-cover" src={`${process.env.LOCALE_URL}${author.profile_pic}`}
                   alt={author.name}
                   layout="fill" />
          ) : <span className="absolute w-16 h-16 text-gray-200 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <PhotographIcon />
              </span>}
        
        </div>
        <div>
          <div className="mb-3">
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-300">
              Про {author.name}
            </h4>
          </div>
          <div>
            {/*{author.bio && <PortableText value={author.bio} />}*/}
            Краткое описание
          </div>
          <Link
            className={
              "text-blue-600 dark:text-blue-500 bg-brand-secondary/20"
            }
            href={`/author/${performer.id}`}>
            Посмотреть профиль
          </Link>
        </div>
      </div>
    </div>
  );
}
