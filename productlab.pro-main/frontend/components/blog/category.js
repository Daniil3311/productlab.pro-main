import Label from "@components/ui/label";
import Link from "next/link";

export default function CategoryLabel({ category }) {
  return (
    <div className={"flex items-center gap-2"}>
      {category?.length &&
        category.slice(0).map((categoryItem, index) => (
          <Link href={`/category/${categoryItem.id}`} key={index}>
            <a>
              <Label color={"pink"}>{categoryItem.name}</Label>
            </a>
          </Link>
        ))}
    </div>
  );
}
