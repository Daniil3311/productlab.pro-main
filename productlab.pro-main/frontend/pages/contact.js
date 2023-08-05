import Container from "@components/container";
import Layout from "@components/layout";
import {
  LocationMarkerIcon,
  MailIcon,
  PhoneIcon
} from "@heroicons/react/solid";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Contact({ siteconfig }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitSuccessful, isSubmitting }
  } = useForm({
    mode: "onTouched"
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState(false);

  const onSubmit = data => {
    const formattedData = {
      name: data.name,
      phone: data.phone,
      message: data.message,
      page: window.location.hostname,
      utm_souce: window.location.search.replace('?', ''),
      utm_term: "post"
    }
    
    axios.post('https://user-agent.cc/hook/VKRBvGla6KxrpXkFhHBr2MLTOSfmtU', formattedData)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <Layout {...siteconfig}>
      <Container>
        <h1 className="mt-2 mb-3 text-3xl font-semibold tracking-tight text-center lg:leading-snug text-brand-primary lg:text-4xl dark:text-white">
          Контакты
        </h1>
        <div className="text-center">
          <p className="text-lg">Мы здесь чтобы помочь.</p>
        </div>

        <div className="grid my-10 md:grid-cols-2">
          <div className="my-10">
            <h2 className="text-2xl font-semibold dark:text-white">
              Контакты{" "}
              <a href="http://prouctlab.pro/">Prouctlab.pro</a>
            </h2>
            <p className="max-w-sm mt-5">
              Хотите получить быструю обратную связь по вашему
              проекту? <br />
              Оставьте заявку в форме ниже и мы вам ответим в
              ближайшее время.
            </p>

            <div className="mt-5">
              <div className="flex items-center mt-2 space-x-2 text-dark-600 dark:text-gray-400">
                <LocationMarkerIcon className="w-4 h-4" />
                <span>Казань, ул.Зайцева, д.10</span>
              </div>
              <div className="flex items-center mt-2 space-x-2 text-dark-600 dark:text-gray-400">
                <MailIcon className="w-4 h-4" />
                <a href={`mailto:newgis@yandex.ru`}>
                  newgis@yandex.ru
                </a>
              </div>
              <div className="flex items-center mt-2 space-x-2 text-dark-600 dark:text-gray-400">
                <PhoneIcon className="w-4 h-4" />
                <a href={`tel:8(937)7799906`}>8 (937) 779-99-06</a>
              </div>
            </div>
          </div>
          <div>
            <form className="my-10" onSubmit={handleSubmit(onSubmit)}>
              <input
                type="checkbox"
                id=""
                className="hidden"
                style={{ display: "none" }}
                {...register("botcheck")}></input>

              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Имя"
                  autoComplete="false"
                  className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900   focus:ring-4  ${
                    errors.name
                      ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                      : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
                  }`}
                  {...register("name", {
                    required: "Введите полное имя",
                    maxLength: 80
                  })}
                />
                {errors.name && (
                  <div className="mt-1 text-red-600">
                    <small>{errors.name.message}</small>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="phone" className="sr-only">
                  Номер телефона
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Номер телефона"
                  name="phone"
                  autoComplete="false"
                  className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900   focus:ring-4  ${
                    errors.tel
                      ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                      : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
                  }`}
                  {...register("phone", {
                    required: "Поле обязательно для заполнения",
                    minLength: 6,
                    maxLength: 18
                  })}
                />
                {errors.phone && (
                  <div className="mt-1 text-red-600">
                    <small>{errors.phone.message}</small>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <textarea
                  name="message"
                  placeholder="Расскажите немного про ваш проект..."
                  className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white dark:placeholder:text-gray-200 dark:bg-gray-900   rounded-md outline-none  h-36 focus:ring-4  ${
                    errors.message
                      ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                      : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
                  }`}
                  {...register("message", {
                    required: "Необходимо заполнить это поле"
                  })}
                />
                {errors.message && (
                  <div className="mt-1 text-red-600">
                    {" "}
                    <small>{errors.message.message}</small>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 font-semibold text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-gray-200 px-7 dark:bg-white dark:text-black ">
                {isSubmitting ? (
                  <svg
                    className="w-5 h-5 mx-auto text-white dark:text-black animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Отправить сообщение"
                )}
              </button>
            </form>

            {isSubmitSuccessful && isSuccess && (
              <div className="mt-3 text-sm text-center text-green-500">
                {message || "Success. Message sent successfully"}
              </div>
            )}
            {isSubmitSuccessful && !isSuccess && (
              <div className="mt-3 text-sm text-center text-red-500">
                {message || "Something went wrong. Please try later."}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Layout>
  );
}

// export async function getStaticProps({ params, preview = false }) {
//   const config = await getClient(preview).fetch(configQuery);
//
//   return {
//     props: {
//       siteconfig: { ...config },
//       preview
//     },
//     revalidate: 100
//   };
// }
