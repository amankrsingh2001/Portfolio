"use client"

import { ModalData } from "@/utils/CmdModal";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { FiLinkedin } from "react-icons/fi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { VscGithubAlt } from "react-icons/vsc";
import { FaArrowTurnDown, FaArrowTurnUp, FaXTwitter } from "react-icons/fa6";
import Enter from "../svg/Enter";
import UpArrow from "../svg/UpArrow";
import DownArrow from "../svg/DownArrow";



export default function CommandModal(){
    const [activeRoute, setActiveRoute] = useState<number>(0)
    const pathname = usePathname()


    useEffect(()=>{
        const keyHandler=(e:KeyboardEvent)=>{
            switch (true){
                case (e.key === "ArrowDown" ) && activeRoute<ModalData.length-1:
                    setActiveRoute(activeRoute+1)
                    break;
                case (e.key === "ArrowUp" ) && activeRoute>0:
                    setActiveRoute(activeRoute-1)
                    break;
                default: break;
            }
                

        }
        

        window.addEventListener('keydown', keyHandler)
        return ()=>removeEventListener('keydown', keyHandler)
    })

    useEffect(() => {
        const activeElement = document.getElementById(`command-item-${activeRoute}`);
        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [activeRoute]);

    return <div className="inset-0 fixed z-[1000] place-items-center overflow-auto  bg-black h-screen text-white  backdrop-blur-md" >
            <div className="w-full relative h-full flex justify-center items-center">
                <div className=" absolute top-28 flex flex-col w-[80%] md:w-[48%] lg:w-[32%] overflow-y-auto h-[400px]  bg-[#191919] border-[1px] border-[#262626] rounded-2xl  overflow-hidden">
                    <div className="flex w-full justify-around h-[70px] px-4 border-b border-[#262626]  space-x-3">
                    <Search className="my-auto text-[#A3A3A3]"/>
                    <input className="w-[95%] font-mulish outline-none" placeholder="Search..."/>
     
                    </div>

                    <div className="mt-2 px-2 overflow-scroll  ">
                        <p className="text-sm tracking-wide text-[#A3A3A3] ml-1 font-mulish">Navigation</p>

                        <div className="w-full py-1 ">
                        {
                            ModalData.map((el, index)=>{
                                const Logo = el.logo;
                                return <div id={`command-item-${index}`} key={index} onMouseEnter={()=>setActiveRoute(index)} className={`flex group hover:bg-[#262626] transition-all duration-200 py-1 rounded-md  px-2 ${activeRoute === index ?"bg-[#262626]":""} items-center space-x-4 mt-1 cursor-pointer`}>
                                    <div className={`border-2 rounded-md w-[40px] h-full py-1 flex justify-center   ${pathname==el.link?"bg-blue-500 text-white":"group-hover:bg-[#D4D4BD] group-hover:text-black" }`}>            
                                        
                                        <Logo className={`w-7 h-7 p-1 rounded-md `}/>
                                    </div>

                                        <div className={`flex flex-col `}>
                                            <p className={`text-md font-mulish`}>{el.title}</p>
                                            <p className="text-sm text-[#A3A3A3]">{el.description}</p>
                                        </div>
                                    </div>
                            })
                        }
                        </div>
                    </div>

                    <div className="flex items-center px-3 border-t-2  border-[#262626] py-[10px] ">
                        <div className="flex space-x-3 ">
                        <Link className="ml-1 text-[#B3B3B3] text-lg font-extralight" href={'/'}>
                                < FiLinkedin />
                            </Link>
                            <Link className="ml-1 text-[#B3B3B3] text-lg font-extralight" href={'/'}>
                            <VscGithubAlt />
                            </Link>
                            <Link className="ml-1 text-[#B3B3B3] text-lg font-extralight" href={'/'}>
                            <FaXTwitter />
                            </Link>
                        </div>

                        <div className="flex ml-auto justify-end space-x-4 items-center ">
                               <div className="flex border-r-2 px-4">
                                        <div className="flex justify-center bg-[#595657]  px-1 py-[1px] whitespace-nowrap items-center  rounded-sm">
                                           <UpArrow />
                                            <DownArrow/>
                                            </div>
                                            <p className="text-sm font-light  ml-2 font-mulsih">to naviage</p>
                               </div>

                               <div className="flex items-center  whitespace-nowrap justify-center">  
                                <p className="text-xs text-end"> Press <span className="inline-flex items-center rounded-sm justify-center bg-[#595657] px-2 py-[3px] "><Enter/></span> to open</p>
                               </div>
                        </div>
                            
                    </div>
                </div>
            </div>
    </div>
}