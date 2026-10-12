// Personal facts, dates, links, and reported outcomes are sourced from Aman's résumé.
// Keep approximate metrics qualified. Project images are screenshots of the live sites.
export const portfolio = {
  name: "Aman Kumar Singh",
  role: "Full Stack Developer · MERN",
  specialization: "Node.js & backend engineering",
  location: "Jaipur, India",
  intro:
    "Good products feel simple. I build the complicated bits: secure APIs, live updates, and React interfaces that make everything click.",
  heroIntro: {
    opening: "Good products feel",
    emphasis: "simple.",
    lead: "I build the complicated bits —",
    closing: "that make everything click.",
    details: [
      { label: "secure APIs", flow: ["request", "authenticate", "respond"], note: "A solid foundation." },
      { label: "live updates", flow: ["event", "WebSocket", "screen"], note: "No refresh required." },
      { label: "React interfaces", flow: ["state", "component", "experience"], note: "Every interaction considered." },
    ],
  },
  approach:
    "Reliable services. Maintainable code. Responsive interfaces. I work across the stack—from API integrations and authentication to frontend workflows, testing, and production debugging.",
  email: "amankrsingh6001@gmail.com",
  phone: { label: "+91 7272950156", href: "tel:+917272950156" },
  social: {
    github: "https://github.com/amankrsingh2001",
    linkedin: "https://www.linkedin.com/in/aman-kr-singh08/",
  },
  resume: "/aman-kumar-singh-resume.pdf",
  about:
    "I’m Aman, a full stack developer working at Sarv.com in Jaipur. My work brings together Node.js services, React and Next.js interfaces, and the infrastructure behind them. I’ve built secure authentication, serverless data processing on Azure, and real-time features with WebSockets and Redis.",
  projects: [
    {
      id: "01",
      title: "ClassNotion",
      category: "Ed-tech platform",
      kind: "learning",
      description:
        "A full-stack learning platform that brings course creation, enrollment, and progress tracking into one experience, serving 1,000+ users.",
      role: "Full-stack development",
      stack: "React.js, Redux Thunk, Node.js, Express.js, MongoDB",
      detail:
        "Designed a secure Express.js backend with JWT authentication and Bcrypt, and integrated Razorpay payments. The platform supports the journey from publishing a course to enrolling and tracking learning progress.",
      outcomes: [
        { value: "1,000+", label: "Users served" },
        { value: "≈98–99%", label: "Payment transaction success" },
      ],
      demo: "https://class-notion.vercel.app",
      image: "/projects/classnotion.png",
      source: "https://github.com/amankrsingh2001/ClassNotion",
      flow: ["Create a course", "Enroll & pay", "Track progress"],
      technicalNote: "JWT + Bcrypt authentication / Razorpay payments",
    },
    {
      id: "02",
      title: "Tracker-Pro",
      category: "Expense tracking application",
      kind: "expenses",
      description:
        "A full-stack expense tracker built with server-rendered Next.js pages, optimized API routes, and a PostgreSQL data layer.",
      role: "Full-stack development",
      stack: "React.js, Next.js (SSR), Prisma, PostgreSQL, JWT",
      detail:
        "Integrated Prisma ORM with PostgreSQL and JWT-based authentication. Server-side rendering and API route optimization improved performance by approximately 25–35%. Deployed on Vercel with approximately 98–99% uptime.",
      outcomes: [
        { value: "≈25–35%", label: "Performance improvement" },
        { value: "≈98–99%", label: "Deployment uptime" },
      ],
      demo: "https://trackerpro.vercel.app/",
      image: "/projects/tracker-pro.png",
      source: "https://github.com/amankrsingh2001/Expense-tracker",
      flow: ["Next.js SSR", "Prisma ORM", "PostgreSQL"],
      technicalNote: "JWT authentication / Deployed on Vercel",
    },
  ],
  skills: [
    { label: "Languages", items: ["JavaScript", "TypeScript", "SQL"] },
    {
      label: "Frontend",
      items: [
        "React.js",
        "Next.js",
        "Redux Thunk",
        "Tailwind CSS",
        "HTML5",
        "CSS3",
      ],
    },
    {
      label: "Backend",
      items: [
        "Node.js",
        "Express.js",
        "REST API Design",
        "WebSocket",
        "Serverless Architecture",
      ],
    },
    {
      label: "Security",
      items: ["JWT", "Bcrypt", "RBAC", "Redis-backed Session Management"],
    },
    {
      label: "Databases",
      items: [
        "MongoDB",
        "PostgreSQL",
        "Azure SQL Database",
        "Prisma",
        "Mongoose",
      ],
    },
    {
      label: "Cloud & tools",
      items: [
        "Azure Blob Storage",
        "Azure Function Apps",
        "Git",
        "Postman",
        "Vercel",
        "CI/CD",
      ],
    },
  ],
  experience: [
    {
      role: "Software Engineer (Full Stack Developer)",
      organization: "Sarv.com",
      dates: "Jul 2026 — Present",
      location: "Jaipur, India",
      current: true,
      summary:
        "Building and shipping features for live production applications at a product-based company.",
      highlights: [
        "Collaborating with cross-functional teams to design, develop, and maintain scalable features using Node.js, React.js, and REST APIs.",
        "Developing backend services, API integrations, and frontend workflows with a focus on performance, reliability, and maintainable code.",
        "Contributing to feature development, debugging, testing, and production issue resolution throughout the application lifecycle.",
      ],
    },
    {
      role: "Full Stack Developer (React / Next.js / Node.js)",
      organization: "Bluetris Technologies",
      dates: "May 2025 — Jul 2026",
      location: "",
      current: false,
      summary:
        "Developed serverless data processing, reusable interfaces, and real-time services.",
      highlights: [
        "Built a serverless Azure Function App to parse and validate XML voyage data, then upload processed output to Azure Blob Storage, reducing manual data-review effort.",
        "Built 10+ reusable, responsive UI components with React, Next.js, TypeScript, and Tailwind CSS, improving user engagement by approximately 35–45%.",
        "Implemented Redis-backed authentication and session management for secure token storage and reliable concurrent sessions.",
        "Reduced initial page load time by approximately 20–30% through lazy loading and code splitting, and built real-time data sync with WebSocket and Redis pub/sub.",
      ],
    },
    {
      role: "Full Stack Developer (React.js / Node.js)",
      organization: "Lonex Technologies",
      dates: "Nov 2023 — May 2025",
      location: "",
      current: false,
      summary:
        "Built REST APIs, secure access controls, and integrations across product modules.",
      highlights: [
        "Engineered RESTful APIs with Node.js and Express.js for reliable data exchange between frontend and backend services across multiple product modules.",
        "Implemented JWT authentication and role-based access control (RBAC), and integrated third-party APIs and payment gateways.",
      ],
    },
  ],
  education: {
    institution: "Arya College of Engineering and IT",
    degree: "Bachelor of Technology in Electronics and Communication",
    dates: "2019 — 2023",
    location: "Jaipur, Rajasthan",
  },
  certifications: [
    {
      title: "Full Stack Development",
      issuer: "Udemy",
      url: "https://drive.google.com/file/d/1gOWgHGiCSA_OjpgdGj5zLD5fcF-G35av/view",
    },
  ],
};

// High-level logical relationships derived from the résumé and user corrections.
// Parallel delivery from Azure Functions to TIBCO and Blob Storage was supplied
// by the user. No inferred hosting,
// infrastructure, or company technologies are assigned to the personal projects.
export const architectures = [
  {
    id: "classnotion",
    projectId: "01",
    title: "ClassNotion",
    category: "LEARNING PLATFORM",
    summary:
      "A learning experience backed by secure APIs, course data, and payment integration.",
    nodes: [
      {
        label: "Frontend",
        technology: "React.js",
        detail: "Redux Thunk · Course workflows",
        icon: "frontend",
      },
      {
        label: "Backend / API",
        technology: "Node.js + Express.js",
        detail: "Course creation & enrollment",
        icon: "backend",
      },
      {
        label: "Database",
        technology: "MongoDB",
        detail: "Application data",
        icon: "database",
      },
    ],
    connections: ["API requests", "Data access"],
    integrations: [
      {
        source: "Express.js backend",
        label: "Authentication",
        technology: "JWT + Bcrypt",
        detail: "Token authentication & password hashing",
        icon: "security",
      },
      {
        source: "Express.js backend",
        label: "Payment integration",
        technology: "Razorpay",
        detail: "Course payments",
        icon: "external",
      },
    ],
    deployment: "",
  },
  {
    id: "trackerpro",
    projectId: "02",
    title: "Tracker-Pro",
    category: "EXPENSE TRACKING",
    summary:
      "Server-rendered pages, authenticated API routes, and a typed database access layer.",
    nodes: [
      {
        label: "Frontend",
        technology: "React.js + Next.js",
        detail: "Server-side rendering",
        icon: "frontend",
      },
      {
        label: "Backend / Auth",
        technology: "Next.js API routes",
        detail: "JWT authentication",
        icon: "security",
      },
      {
        label: "Data access",
        technology: "Prisma",
        detail: "Object-relational mapping",
        icon: "backend",
      },
      {
        label: "Database",
        technology: "PostgreSQL",
        detail: "Expense data",
        icon: "database",
      },
    ],
    connections: ["API requests", "Queries", "Data access"],
    integrations: [],
    deployment:
      "Next.js application deployed on Vercel. Database hosting is not specified.",
  },
  {
    id: "azure",
    projectId: null,
    title: "Voyage data processing",
    category: "BLUETRIS TECHNOLOGIES / CLOUD WORKFLOW",
    summary:
      "XML voyage data is parsed and validated, then sent to TIBCO and Azure Blob Storage in parallel.",
    nodes: [
      {
        label: "Input",
        technology: "XML voyage data",
        detail: "Source documents",
        icon: "external",
      },
      {
        label: "Processing",
        technology: "Azure Function App",
        detail: "Parse & validate",
        icon: "cloud",
      },
    ],
    connections: ["Process XML"],
    integrations: [
      {
        source: "Azure Function App",
        label: "Send data",
        technology: "TIBCO",
        detail: "Processed voyage data",
        icon: "backend",
      },
      {
        source: "Azure Function App",
        label: "Upload output",
        technology: "Azure Blob Storage",
        detail: "Processed voyage data",
        icon: "database",
      },
    ],
    deployment: "",
  },
];
