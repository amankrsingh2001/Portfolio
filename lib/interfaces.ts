export interface ModalDataStructure {
    title: String;
    description: String;
    logo: React.FC;
    link: string;
  }
  
  export interface GroupModalData {
    header: string;
    items: ModalDataStructure[];
  }
  
  export interface NavbarData{
      title:string,
      link:string,
  }