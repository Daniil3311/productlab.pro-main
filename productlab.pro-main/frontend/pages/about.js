import Container from "@components/container";
import Layout from "@components/layout";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const getServerSideProps = async (context) => {
  const response = await fetch(
    `${process.env.LOCALE_URL}users`
  );
  
  const data = await response.json();
  
  if (!data) {
    return {
      notFound: true
    };
  }
  
  return {
    props: { responseUsers: data }
  };
};

export default function About({ responseUsers }) {
  const [users, setUsers] = useState(responseUsers);
  
  return (
    <Layout>
      <Container>
        <h1
          className="mt-2 mb-3 text-3xl font-semibold tracking-tight text-center lg:leading-snug text-brand-primary lg:text-4xl dark:text-white">
          Про нас
        </h1>
        <div className="text-center">
          <p className="text-lg">Мы - небольшая увлеченная команда.</p>
        </div>
        
        {users && (
          <div className="users-wrapper">
            {users.result.map(user => (
              <div key={user.id}>
                <div
                  key={user.id}
                  className="relative overflow-hidden rounded-md aspect-square">
                  <Image className="object-cover"
                         src={`${process.env.LOCALE_URL}${user.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                         alt={user.name || " "}
                         layout="fill"
                         blurDataURL={`${process.env.LOCALE_URL}${user.profile_pic}` || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                         placeholder="blur" />
                </div>
                <p
                  className={
                    "text-center text-[18px] font-medium mt-1"
                  }>
                  {user.name}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mx-auto prose text-center dark:prose-invert mt-14">
          <p>
            Мы предоставляем подключение в режиме реального времени, чтобы поставщики программного обеспечения и
            финансовые учреждения могли создавать интегрированные продукты для своих клиентов малого бизнеса.
          </p>
          <p>
            Наша инфраструктура API используется клиентами, начиная от кредиторов и заканчивая поставщиками
            корпоративных карт и инструментами бизнес-прогнозирования, с примерами использования, включая автоматическую
            сверку, бизнес-панель мониторинга и принятие решений о выдаче кредита.
          </p>
          <p>
            <Link href="/contact">Get in touch</Link>
          </p>
        </div>
      </Container>
    </Layout>
  );
}