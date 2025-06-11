import {
  FaHouse,
  FaRegCircleUser,
  FaCalendarDays,
  FaRegCalendarDays,
  FaRightFromBracket,
} from "react-icons/fa6";
import { LuSwords } from "react-icons/lu";
import { FaTasks } from "react-icons/fa";
import { MenuItem } from "./MenuItem";
import Link from "next/link";

export const Sider = () => {
  const menu = [
    {
      icon: <FaHouse />,
      title: "Trang Chủ",
      link: "/home",
    },
    {
      icon: <FaRegCircleUser />,
      title: "Hồ sơ",
      link: "/profile",
    },
    {
      icon: <FaCalendarDays />,
      title: "Quản lí nhóm",
      link: "/team-management",
    },
    {
      icon: <FaTasks />,
      title: "Project/Tasks",
      link: "/project-management",
      isLogin: true,
    },
    {
      icon: <LuSwords />,
      title: "Guild Wars",
      link: "/guilds",
      isLogin: true,
    },
    {
      icon: <FaRegCalendarDays />,
      title: "Lịch",
      link: "/calendar",
      isLogin: true,
    },
    {
      icon: <FaRightFromBracket />,
      title: "Đăng xuất",
      link: "/login",
      isLogin: true,
    },
  ];

  return (
    <>
      <header className="inner-header w-[240px] bg-[#EEEEEE] h-full fixed z-50 left-0 top-0">
        <h1 className="text-3xl font-bold py-[40px] text-gray-800">
          <Link href="/dashboard">Ban Công Nghệ</Link>
        </h1>
        <nav className="inner-nav">
          <ul>
            {menu.map((item, index: number) => (
              <MenuItem key={index} item={item} />
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
};
