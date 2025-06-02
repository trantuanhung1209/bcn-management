import Link from "next/link";
import { usePathname } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const MenuItem = (props: any) => {
  const { item, index } = props;

  const pathname = usePathname();

  return (
    <>
      {(item.isLogin === undefined || item.isLogin === item.isLogin) && (
        <li key={index}>
          <Link
            href={item.link}
            className={"block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded flex items-center text-[20px] gap-[20px] border-b-2 border-transparent hover:border-gray-400" + (pathname === item.link ? " bg-gray-300 border-gray-400" : "")}
          >
            {item.icon}
            {item.title}
          </Link>
        </li>
      )}
    </>
  );
};
