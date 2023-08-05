import Container from "@components/container";
import Layout from "@components/layout";
import PostList from "@components/postlist";
import { useState } from "react";
import Image from "next/image";

export const getServerSideProps = async context => {
  const { id } = context.params;
  
  const response = await fetch(
    `${process.env.LOCALE_URL}article?performers_ids=${id}`
  );
  
  const data = await response.json();
  
  if (!data) {
    return {
      notFound: true
    };
  }
  
  return {
    props: { currentAuthorData: data }
  };
};

const Author = ({ currentAuthorData }) => {
  const [authorPosts, setAuthorPosts] = useState(currentAuthorData.result);
  
  return (
    <Layout>
      <Container className="!pt-0">
        {authorPosts && (
          <>
            <div className={"flex flex-col items-center"}>
              {authorPosts[0].performer.profile_pic && (
                <Image className={"rounded-full"}
                       src={`${process.env.LOCALE_URL}${authorPosts[0].performer.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                       alt={authorPosts[0]?.performer?.name || "Thumbnail"}
                       width={80}
                       height={80}
                       blurDataURL={`${process.env.LOCALE_URL}${authorPosts[0].performer.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                       placeholder="blur" />
              )}
              
              <p
                className={"mt-2 text-3xl font-semibold tracking-tight lg:leading-tight text-brand-primary lg:text-3xl dark:text-white"}>{authorPosts[0]?.owner?.name}</p>
              
              <p
                className={"mt-1 text-gray-600 text-xl"}>Количество
                статей: {authorPosts?.length}</p>
            </div>
            <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
              {authorPosts.map(post => (
                <PostList key={post?.id} post={post} author={post?.performer} aspect="square" />
              ))}
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Author;
