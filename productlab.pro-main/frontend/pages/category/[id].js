import CategoryLabel from "@components/blog/category";
import Container from "@components/container";
import Layout from "@components/layout";
import PostList from "@components/postlist";
import { useState } from "react";

export const getServerSideProps = async context => {
  const {id} = context.params;
  
  const response = await fetch(
    `${process.env.LOCALE_URL}article?categories_ids=${id}&show_unpublic=false`
  );
  
  const data = await response.json()
  
  if (!data) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {currentCategoryData: data}
  };
};

const Category = ({currentCategoryData}) => {
  const [authorPosts, setAuthorPosts] = useState(currentCategoryData.result);
  
  return (
    <Layout>
      <Container className="!pt-0">
        {authorPosts && (
          <>
            <div className={"flex flex-col items-center"}>
              <div>
                <div className={"flex items-center gap-2 text-3xl"}>
                  {/*{authorPosts[0]?.category?.length &&*/}
                  {/*  authorPosts[0].category.slice(0).map((categoryItem) => (*/}
                  {/*    <p key={categoryItem.id} className={'text-3xl font-semibold tracking-tight lg:leading-tight text-brand-primary lg:text-5xl dark:text-white'}>{categoryItem.name}</p>*/}
                  {/*  ))}*/}
                  
                  <CategoryLabel category={authorPosts[0]?.category}/>
                </div>
              </div>
              
              <p
                className={"mt-1 text-gray-600 text-xl"}>Количество
                статей: {authorPosts?.length}</p>
            </div>
            
            <div className="grid gap-10 mt-10 lg:gap-10 md:grid-cols-2 xl:grid-cols-3 ">
              {authorPosts?.map(post => (
                <PostList key={post?.id} post={post} author={post?.owner} aspect="square" />
              ))}
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Category;
