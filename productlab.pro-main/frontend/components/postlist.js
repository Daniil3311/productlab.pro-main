import CategoryLabel from "@components/blog/category";
import LottieComponent from "@components/lottieComponent";
import { PhotographIcon } from "@heroicons/react/outline";
import { cx } from "@utils/all";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export default function PostList({ post, aspect, author }) {
  const fileFormat = post?.main_pic?.split(".").pop();
  
  const dateObj = new Date(post?.time_created);
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleString('ru-RU', options);
  
  return (
    <>
      <div className="cursor-pointer link-effect basis-1/2 max-w-full overflow-hidden">
        <div
          className={cx(
            "relative overflow-hidden transition-all bg-gray-100 rounded-md dark:bg-gray-800   hover:scale-105",
            aspect === "landscape" ? "aspect-video" : "aspect-square"
          )}>
          <Link href={`/article/${post.id}`}>
            <a>
              {(post?.header_pic || post?.main_pic) ? (
                <>
                  {fileFormat === "json" ? (
                    <LottieComponent animationUrl={post?.main_pic} />
                  ) : (
                    <>
                      {fileFormat === "mp4" ? <video src={`${process.env.BASE_URL}${post?.main_pic}`} playsinline autoPlay={true} loop={true} muted={true} /> : <Image
                        src={`${process.env.LOCALE_URL}${post?.header_pic}` || `${process.env.LOCALE_URL}${post?.main_pic}`}
                        layout="fill"
                        className={"transition-all object-cover h-full w-full"}
                        blurDataURL={`${process.env.LOCALE_URL}${post?.header_pic}` || `${process.env.LOCALE_URL}${post?.main_pic}`}
                        placeholder="blur"
                        alt={post.first_sentence || "Thumbnail"} />}
                    </>
                  )}
                </>
              ) : (
                <span className="absolute w-16 h-16 text-gray-200 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <PhotographIcon />
              </span>
              )}
            </a>
          </Link>
        </div>
        {post.category[0] && (
          <CategoryLabel category={post.category} />
        )}
        <h2 className="mt-2 text-lg font-semibold tracking-normal text-brand-primary">
          <Link href={`/article/${post.id}`}>
            <a className={"text-dark-500 dark:text-gray-400"}>
               <span className="link-underline link-underline-blue">
              {post?.title || "Без названия"}
            </span>
            </a>
          </Link>
        </h2>
        
        <Link href={`/author/${author?.id}`}>
          <a>
            <div className="flex items-center mt-3 space-x-3 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 w-5 h-5">
                  {author?.profile_pic && (
                    <Image className={"rounded-full"}
                           src={`${process.env.LOCALE_URL}${author?.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                           alt={post?.owner?.name || "Thumbnail"}
                           layout="fill"
                           blurDataURL={`${process.env.LOCALE_URL}${author?.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                           placeholder="blur" />
                  )}
                </div>
                <span className="text-sm">{author.name}</span>
              </div>
              <span className="text-xs text-gray-300 dark:text-gray-600">
              &bull;
            </span>
              <time
                className="text-sm"
                dateTime={post?.time_created || post._createdAt}>
                {formattedDate}
              </time>
            </div>
          </a>
        </Link>
      </div>
    </>
  );
}
