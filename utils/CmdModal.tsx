import {  GroupModalData, NavbarData } from "@/lib/interfaces";
import {
  BookHeart,
  FolderGit2,
  Home,
  Link2,
  NotebookText,
  UserRound,
  LogIn
} from "lucide-react";
import { ReactElement } from "react";



export const ModalData:GroupModalData[] = [
  {
    header: "naviagtion",
    items: [
      {
        title: "Home",
        description: "Welcome to my forever work in progress",
        logo: Home,
        link: "/",
      },
      {
        title: "Projects",
        description: "Showcase of my projects",
        logo: FolderGit2,
        link: "/project",
      },
      {
        title: "Blog",
        description: "Thought and Mental Models",
        logo: NotebookText,
        link: "/blog",
      },
      {
        title: "Guestbook",
        description: "Leave a message for me",
        logo: BookHeart,
        link: "/guestbook",
      },
      {
        title: "Link",
        description: "All my links are here",
        logo: Link2,
        link: "/link",
      },
      {
        title: "About",
        description: "Learn more about me",
        logo: UserRound,
        link: "/about",
      },
    ],
  },
  {
    header:"Account",
    items:[
       { title:"Sign In",
        description:"",
        logo:LogIn,
        link:'/auth'}
    ]
  },{
    header:"General",
    items:[
        {
            title:"Resume",
            description:"See My Resume and You can download it from there",
            logo:UserRound,
            link:'/auth'
        }
    ]
  },{
    header:"Social",
    items:[
        {
            title:"Github",
            description:"View my github profile",
            logo:UserRound,
            link:'/auth'
        },{
            title:"LinkedIn",
            description:"View my Linkedin profile",
            logo:UserRound,
            link:'/auth'
        },{
            title:"x",
            description:"View my x profile",
            logo:UserRound,
            link:'/auth'
        }
    ]
  }
];


export const navbarData:NavbarData[] =[
  {
    title:"home",
    link:'/'
  },{
    title:"work",
    link:'/projects'
  },{
    title:"about",
    link:'/about'
  },{
    title:"blog",
    link:'/blogs'
  },{
    title:"more",
    link:'/more'
  }
]