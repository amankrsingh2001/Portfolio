"use client"

import { useEffect, useState } from "react";
import CommandModal from "./modal/CommandModal";
import { Command } from 'lucide-react';

export default function Landing (){

    const [commandModal, setCommandModal] = useState(false)
    

    useEffect(()=>{

        const keyFireEvent = (e:KeyboardEvent)=>{
            switch(true) {
                case e.metaKey && e.key.toLowerCase() === 'k':
                setCommandModal(prev=>!prev)
                break;
                case e.key == "Escape":
                setCommandModal(false)
                break;
             
            }
            
            
        }    
        

        window.addEventListener('keydown',keyFireEvent)
        return () => window.removeEventListener('keydown', keyFireEvent)
    },[])


    
    return <div className="w-full h-full ">
           <div className="w-[80%] mx-auto flex items-center  h-24 justify-between">
                <img src={'file.svg'} width={50} height={50}/>
                <div>
                    <button onClick={()=>setCommandModal(true)} className="text-xs cursor-pointer px-2 py-2 flex space-x-2 ">
                        <Command className="text-[#E0E0C7] inline-block self-center" size={"20px"}/> <span className="text-xl font-bold">&#43; K</span>
                    </button>
                </div>
           </div>

        {
            commandModal && <CommandModal/>
        }
    </div>
}