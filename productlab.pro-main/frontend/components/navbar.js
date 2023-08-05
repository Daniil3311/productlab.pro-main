import Container from "@components/container";
import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import LogoWhite from "../public/img/logo-white.svg";
import Logo from "../public/img/logo.svg";

export default function Navbar() {
  const leftmenu = [
    {
      label: "Главная",
      href: "/"
    },
    {
      label: "Про нас",
      href: "/about"
    }
  ];

  const rightmenu = [
    {
      label: "Контакты",
      href: "/contact"
    },
  ];

  const mobilemenu = [...leftmenu, ...rightmenu];

  return (
    <Container>
      <nav>
        <Disclosure>
          {({ open }) => (
            <>
              <div className="flex flex-wrap justify-between md:gap-10 md:flex-nowrap">
                <div className="flex-col items-center justify-start order-1 hidden w-full md:flex md:flex-row md:justify-end md:w-auto md:order-none md:flex-1">
                  {leftmenu.map((item, index) => (
                    <Link href={item.href} key={index}>
                      <a className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500">
                        {item.label}
                      </a>
                    </Link>
                  ))}
                </div>
                <div className="flex justify-between w-full md:w-auto">
                  <Link href="/">
                    <a className="w-32 dark:hidden">
                      <Image
                        src={Logo}
                        alt="logo"
                        blurDataURL={Logo}
                        placeholder="blur"
                      />
                    </a>
                  </Link>
                  <Link href="/">
                    <a className="hidden w-32 dark:block">
                      <Image
                        src={LogoWhite}
                        blurDataURL={LogoWhite}
                        alt="logo"
                        placeholder="blur"
                      />
                    </a>
                  </Link>
                  <Disclosure.Button
                    aria-label="Toggle Menu"
                    className="px-2 py-1 ml-auto text-gray-500 rounded-md md:hidden focus:text-blue-500 focus:outline-none dark:text-gray-300 ">
                    <svg
                      className="w-6 h-6 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24">
                      {open && (
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                        />
                      )}
                      {!open && (
                        <path
                          fillRule="evenodd"
                          d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                        />
                      )}
                    </svg>
                  </Disclosure.Button>
                </div>

                <div className="flex-col items-center justify-start order-2 hidden w-full md:flex md:flex-row md:w-auto md:flex-1 md:order-none">
                  {rightmenu.map((item, index) => (
                    <Link href={item.href} key={index}>
                      <a
                        className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500"
                        target={item.external ? "_blank" : ""}
                        rel={item.external ? "noopener" : ""}>
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  <a href="#newlead"
                     className="py-1 font-semibold text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-offset-4 focus:ring focus:ring-gray-200 px-4 dark:bg-white dark:text-black ">Оставить
                    заявку</a>
                </div>
              </div>
              <Disclosure.Panel>
                <div className="flex flex-col items-center justify-start order-2 w-full md:hidden">
                  {mobilemenu.map((item, index) => (
                    <Link href={item.href} key={index}>
                      <a
                        className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500"
                        target={item.external ? "_blank" : ""}
                        rel={item.external ? "noopener" : ""}>
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  <a href="#newlead"
                     className="py-1 font-semibold text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-offset-4 focus:ring focus:ring-gray-200 px-4 dark:bg-white dark:text-black ">Оставить
                    заявку</a>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </nav>
    </Container>
  );
}
