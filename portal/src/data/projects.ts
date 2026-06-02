export interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  status: 'completed' | 'in-progress';
  date: string;
  githubLink: string;
  liveLink: string;
  stars: number;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "A full-stack e-commerce application with user authentication, product catalog, shopping cart, and payment gateway integration.",
    tech: ["React", "Node.js", "Express", "MongoDB", "Redux"],
    status: "completed",
    date: "Dec 2025",
    githubLink: "https://github.com/rahul/ecommerce",
    liveLink: "https://shop-app.demo.com",
    stars: 12,
  },
  {
    id: 2,
    title: "ML Image Classifier",
    description: "Deep learning model to classify images into 1000 categories using Transfer Learning with ResNet50.",
    tech: ["Python", "TensorFlow", "Keras", "Flask"],
    status: "in-progress",
    date: "Jan 2026",
    githubLink: "https://github.com/rahul/image-classifier",
    liveLink: "",
    stars: 5,
  },
  {
    id: 3,
    title: "Portfolio Website",
    description: "Personal portfolio website to showcase projects, skills, and resume. Built with Next.js and Tailwind CSS.",
    tech: ["Next.js", "Tailwind CSS", "Framer Motion"],
    status: "completed",
    date: "Nov 2025",
    githubLink: "https://github.com/rahul/portfolio",
    liveLink: "https://rahul.dev",
    stars: 8,
  },
];
