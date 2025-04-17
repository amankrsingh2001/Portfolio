"use client"

import { useEffect, useState } from "react";
import CommandModal from "./modal/CommandModal";

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


    
    return <div className="w-full h-full border-2 border-white">
        {
            commandModal && <CommandModal/>
        }
    </div>
}