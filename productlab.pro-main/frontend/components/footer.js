import Container from "@components/container";
import ThemeSwitch from "@components/themeSwitch";

export default function Footer(props) {
  return (
    <Container className="mt-10 border-t border-gray-100 dark:border-gray-800">
      <div className="text-sm text-center">
        Copyright © {new Date().getFullYear()} {props?.copyright}. Все права защищены.
      </div>
      {/*<div className="flex items-center justify-center mt-2">*/}
      {/*  <ThemeSwitch />*/}
      {/*</div>*/}
    </Container>
  );
}