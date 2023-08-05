import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { NextSeo } from "next-seo";
import React from "react";

export default function Layout(props) {
  const { children } = props;
  
  return (
    <>
      <NextSeo
        title={`productlab.pro - ${props.title}`}
        description={props.first_sentence || ""}
        canonical={`productlab.pro`}
        openGraph={{
          url: `productlab.pro`,
          type: 'website',
          title: `productlab.pro - ${props.title}`,
          description: props.first_sentence || "",
          images: [
            {
              url: `${process.env.LOCALE_URL}${props?.header_pic}` || `${process.env.LOCALE_URL}${props?.main_pic}` || "",
              width: 800,
              height: 600,
              alt: ""
            }
          ],
          site_name: 'productlab.pro'
        }}
        twitter={{
          cardType: "summary_large_image",
          image: `${process.env.LOCALE_URL}${props?.header_pic}` || `${process.env.LOCALE_URL}${props?.main_pic}` || "",
        }}
      />

      <div className="antialiased text-gray-800 dark:bg-black dark:text-gray-400">
        <Navbar {...props} />
        
        <div>{children}</div>

        <Footer {...props} />
      </div>
    </>
  );
}
