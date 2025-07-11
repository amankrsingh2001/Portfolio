"use client";

import {  ModalData } from "@/utils/CmdModal";
import { AnimatePresence, motion } from "motion/react";
import { Scale, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FiLinkedin } from "react-icons/fi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { VscGithubAlt } from "react-icons/vsc";
import { FaXTwitter } from "react-icons/fa6";
import Enter from "../svg/Enter";
import UpArrow from "../svg/UpArrow";
import DownArrow from "../svg/DownArrow";
import { GroupModalData, ModalDataStructure } from "@/lib/interfaces";

export default function CommandModal() {
  const [outerRoute, setouterRoute] = useState<number>(0);
  const [innerRoute, setInnerRoute] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [commandData, setCommandData] = useState<any>(ModalData);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          if (commandData[outerRoute]?.items) {
            const currentGroup = commandData[outerRoute].items;
            if (innerRoute < currentGroup.length - 1) {
              setInnerRoute((prev) => prev + 1);
            } else if (commandData.length - 1 > outerRoute) {
              const nextGroup = commandData[outerRoute + 1].items;
              if (nextGroup.length > 0) {
                setouterRoute((prev) => prev + 1);
                setInnerRoute(0);
              }
            }
          }
          break;

        case "ArrowUp":
          if (commandData[outerRoute].items) {
            const currentGroup = commandData[outerRoute].items;
            if (innerRoute > 0) {
              setInnerRoute((prev) => prev - 1);
            } else if (outerRoute > 0) {
              const prevGroup = commandData[outerRoute - 1].items;
              if (prevGroup.length > 0) {
                setouterRoute((prev) => prev - 1);
                setInnerRoute(prevGroup.length - 1);
              }
            }
          }
          break;

        case "Enter":
          router.push(commandData[outerRoute].items[innerRoute].link);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => removeEventListener("keydown", keyHandler);
  }, [outerRoute, innerRoute, commandData, router]);

  useEffect(() => {
    const activeElement = document.getElementById(
      `command-item-${innerRoute}-${outerRoute}`
    );
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [innerRoute]);

  const InputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setInputValue(val);

    if (val === "") {
      setCommandData(ModalData);
    } else {
      const cmdFilterData = commandData
        .map((val:GroupModalData) => {
          return {
            header: val.header,
            items: val.items.filter((el) => {
              return el.title.toLowerCase().includes(inputValue.toLowerCase());
            }),
          };
        })
        .filter((obj:GroupModalData) => {
          return obj.items.length > 0 && obj;
        });

      console.log(cmdFilterData);
      setCommandData(cmdFilterData);
    }
  };

  const childVariant = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.9,
        type: "spring",
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div className="inset-0 fixed z-[1000] place-items-center overflow-auto  bg-black h-screen text-white  backdrop-blur-md">
        <div className="w-full relative h-full flex justify-center items-center">
          <motion.div
            variants={childVariant}
            initial="hidden"
            animate="visible"
            className=" absolute top-42 flex flex-col w-[80%] md:w-[48%] lg:w-[32%] overflow-y-auto h-[400px]  bg-[#191919] border-[1px] border-[#262626] rounded-2xl  overflow-hidden"
          >
            <div className="flex w-full justify-around h-[70px] px-4 border-b border-[#262626]  space-x-3 ">
              <Search className="my-auto text-[#A3A3A3]" />
              <input
                value={inputValue}
                onChange={InputHandler}
                className="w-[95%] font-mulish outline-none"
                placeholder="Spotlight Search..."
              />
            </div>

            <div className="mt-2 px-2 overflow-scroll h-[350px]">
              <div className="w-full py-1 ">
                {commandData.map((data:GroupModalData, idx:number) => {
                  return (
                    <div key={idx} className="space-y-1.5">
                      <p className="text-sm capitalize tracking-wide text-[#A3A3A3] ml-1 font-mulish">
                        {data.header}
                      </p>
                      {data.items.map((el: ModalDataStructure, index: number) => {
                        const Logo = el.logo;
                        return (
                          <div
                            tabIndex={0}
                            id={`command-item-${index}-${idx}`}
                            key={index}
                            onMouseEnter={() => {
                              setouterRoute(idx);
                              setInnerRoute(index);
                            }}
                            className={` flex group hover:bg-[#262626] transition-all duration-200 py-1.5 rounded-md  px-2 
                                                ${
                                                  innerRoute === index &&
                                                  outerRoute === idx
                                                    ? "bg-[#262626]"
                                                    : ""
                                                } items-center space-x-4 mt-1 cursor-pointer`}
                          >
                            <div
                              className={`border-[1px] border-[#262626]xppx rounded-md w-[40px] h-full py-1 flex justify-center 
                                                          ${
                                                            pathname == el.link
                                                              ? "bg-blue-500 text-white"
                                                              : "group-hover:bg-[#D4D4BD] group-hover:text-black"
                                                          }`}
                            >
                              {/* @ts-ignore */}
                              <Logo className={`w-7 h-7 p-1 rounded-md `} />
                            </div>

                            <div className={`flex flex-col `}>
                              <p className={`text-md font-outfit`}>
                                {el.title}
                              </p>
                              <p className="text-xs text-[#A3A3A3]">
                                {el.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {idx != 3 && (
                        <div className="h-[1px] mt-2 mb-1 w-full bg-[#262626]"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center px-3 border-t-2  border-[#262626] py-[10px] ">
              <div className="flex space-x-3 ">
                <Link
                  className="ml-1 text-[#B3B3B3] text-lg font-extralight"
                  href={"/"}
                >
                  <FiLinkedin />
                </Link>
                <Link
                  className="ml-1 text-[#B3B3B3] text-lg font-extralight"
                  href={"/"}
                >
                  <VscGithubAlt />
                </Link>
                <Link
                  className="ml-1 text-[#B3B3B3] text-lg font-extralight"
                  href={"/"}
                >
                  <FaXTwitter />
                </Link>
              </div>

              <div className="flex ml-auto justify-end space-x-4 items-center ">
                <div className="flex border-r-2 px-4">
                  <div className="flex justify-center bg-[#595657]  px-1 py-[1px] whitespace-nowrap items-center  rounded-sm">
                    <UpArrow />
                    <DownArrow />
                  </div>
                  <p className="text-sm font-light  ml-2 font-mulsih">
                    to naviage
                  </p>
                </div>

                <div className="flex items-center  whitespace-nowrap justify-center">
                  <p className="text-xs text-end">
                    {" "}
                    Press{" "}
                    <span className="inline-flex items-center rounded-sm justify-center bg-[#595657] px-2 py-[3px] ">
                      <Enter />
                    </span>{" "}
                    to open
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
