import { BookHeart, FolderGit2, Home, Link2, NotebookText } from "lucide-react"
import { ReactElement } from "react"

interface ModalData {
    title:String,
    description:String,
    logo:React.FC,
    link:string
}

export const ModalData:ModalData[] = [
    {
            title:"Home",
            description:"Welcome to my forever work in progress",
            logo:Home,
            link:'/'
    },
    {
            title:"Projects",
            description:"Showcase of my projects",
            logo:FolderGit2,
            link:'/project'
    },
    {
        title:"Blog",
        description:"Thought and Mental Models",
        logo:NotebookText,
        link:'/blog'
    },
    {
        title:"Guestbook",
        description:"Leave a message for me",
        logo:BookHeart,
        link:'/guestbook'
    },{
        title:"Link",
        description:"All my links are here",
        logo:Link2,
        link:'/link'
    },{
        title:"About",
        description:"Learn more about me",
        logo:Link2,
        link:'/about'
    }
]