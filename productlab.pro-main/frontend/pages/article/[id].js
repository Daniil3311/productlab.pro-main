import AuthorCard from "@components/blog/authorCard";
import CategoryLabel from "@components/blog/category";
import Container from "@components/container";
import Layout from "@components/layout";
import LottieComponent from "@components/lottieComponent";
import { PhotographIcon } from "@heroicons/react/outline";
import { format, parseISO } from "date-fns";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { useState } from "react";

export const getServerSideProps = async context => {
  const { id } = context.params;
  
  const response = await fetch(
    `${process.env.LOCALE_URL}article/${id}`
  );
  
  const data = await response.json();
  
  if (!data) {
    return {
      notFound: true
    };
  }
  
  return {
    props: { currentPostData: data }
  };
};

export default function Article({ currentPostData }) {
  console.log(currentPostData);
  const [currentPost, setCurrentPost] = useState(currentPostData);
  
  const [content, setContent] = useState(currentPostData.content);
  
  const hasIframe = /<iframe.*?>.*?<\/iframe>/s.test(content);
  
  if (hasIframe) {
    const videoUrl = content.match(/src="(.+?)"/)[1] + '#t=0.001';
  
    const formattedContent = content.replace(/<iframe.+<\/iframe>/, `<video className="mx-auto relative" src=${videoUrl} playsinline controls></video>`);
  
    setContent(formattedContent);
  }
  
  const fileFormat = currentPostData?.main_pic?.split(".").pop();
  
  const dateObj = new Date(currentPost?.time_created);
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleString('ru-RU', options);
  
  return (
    <>
      {currentPost && (
        <Layout post={currentPost}>
          <NextSeo
            title={`productlab.pro - ${currentPost.title}`}
            description={currentPost.first_sentence || ""}
            canonical={`productlab.pro`}
            openGraph={{
              url: `productlab.pro`,
              title: `productlab.pro - ${currentPost.title}`,
              description: currentPost.first_sentence || "",
              images: [
                {
                  url: `${process.env.BASE_URL}${currentPost?.header_pic}` || `${process.env.BASE_URL}${currentPost?.main_pic}` || "",
                  width: 800,
                  height: 600,
                  alt: ""
                }
              ],
              site_name: "productlab.pro"
            }}
            twitter={{
              cardType: "summary_large_image",
              image: `${process.env.BASE_URL}${currentPost?.header_pic}` || `${process.env.BASE_URL}${currentPost?.main_pic}` || ""
            }}
          />
          
          <Container className="!pt-0">
            <div className="max-w-screen-md mx-auto ">
              <div className="text-center">
                <CategoryLabel categories={currentPost?.categories} />
              </div>
              
              <h1
                className="article__title tracking-tight lg:leading-snug text-brand-primary text-2xl sm:text-4xl dark:text-white">
                {currentPost?.title}
              </h1>
              
              <div className={"flex justify-center"}>
                {currentPost?.category && (
                  <CategoryLabel category={currentPost.category} />
                )}
              </div>
              
              <div className="flex justify-center mt-5 space-x-3 text-gray-500 ">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 author-img">
                    {currentPost?.owner?.profile_pic && (
                      <Image
                        src={`${process.env.LOCALE_URL}${currentPost?.owner?.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                        layout="fill"
                        className={"rounded-full object-cover"}
                        blurDataURL={`${process.env.LOCALE_URL}${currentPost?.owner?.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                        placeholder="blur"
                        alt={currentPost?.owner?.name} />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-400">
                      {currentPost?.owner?.name}
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <time
                        className="text-gray-500 dark:text-gray-400"
                        dateTime={
                          currentPost?.time_created
                        }>
                        {formattedDate}
                      </time>
                      <span>
                        · {currentPost?.estReadingTime || "5"} мин. чтение
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
          
          
          <div className="relative z-0 max-w-screen-lg mx-auto overflow-hidden lg:rounded-lg aspect-video">
            {(currentPost?.main_pic || currentPost?.header_pic) ? (
              <>
                {fileFormat === "json" ? (<div className={'w-[400px] mx-auto'}><LottieComponent animationUrl={currentPost?.main_pic} /></div>) : <>{fileFormat === "mp4" ? <div dangerouslySetInnerHTML={{ __html: `<video className='mx-auto' autoplay loop muted playsinline data-wf-ignore="true" data-object-fit="cover"><source src=${process.env.BASE_URL}${currentPost?.main_pic}></video>`}} /> : <Image
                  src={`${process.env.LOCALE_URL}${currentPost?.main_pic}` || `${process.env.LOCALE_URL}${post?.header_pic}`}
                  layout="fill"
                  className={"object-cover"}
                  blurDataURL={`${process.env.LOCALE_URL}${currentPost?.main_pic}` || `${process.env.LOCALE_URL}${post?.header_pic}`}
                  placeholder="blur"
                  alt={currentPost?.name || "Thumbnail"} />}</>}
              </>
            ) : (
              <span className="absolute w-16 h-16 text-gray-200 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <PhotographIcon />
              </span>
            )}
          </div>
          
          <Container>
            <article className="max-w-screen-md mx-auto ">
              <div
                className="post__content mx-auto my-3 prose prose-base dark:prose-invert prose-a:text-blue-500 break-words">
                {parse(content)}
              </div>
              <div className="allPostsBtn mt-7 mb-7">
                <Link href="/">
                  <a className="px-5 py-2 text-sm text-blue-600 rounded-full dark:text-blue-500 bg-brand-secondary/20 ">
                    ← Посмотреть все статьи
                  </a>
                </Link>
              </div>
              {currentPost?.owner?.name && (
                <AuthorCard
                  author={currentPost?.owner}
                  performer={currentPost?.owner}
                />
              )}
            </article>
          </Container>
        </Layout>
      )}
    </>
  );
}
