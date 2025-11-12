'use client';

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaAngular,
  FaCode,
  FaCss3Alt,
  FaDatabase,
  FaDocker,
  FaGitAlt,
  FaHtml5,
  FaLaravel,
  FaNodeJs,
  FaPhp,
  FaPython,
  FaReact,
  FaVuejs,
} from "react-icons/fa";
import {
  SiDotnet,
  SiGraphql,
  SiJavascript,
  SiK6,
  SiNestjs,
  SiNextdotjs,
  SiNuxtdotjs,
  SiRedux,
  SiSymfony,
  SiTailwindcss,
  SiTestinglibrary,
  SiTypescript,
} from "react-icons/si";
import { BiSitemap } from "react-icons/bi";
import { MdDesignServices, MdOutlineHistoryEdu, MdScience, MdSecurity, MdSpeed } from "react-icons/md";
import { TbTopologyStar } from "react-icons/tb";
import { VscAzureDevops } from "react-icons/vsc";

import SearchBox from "@/components/SearchBox";

const techs = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Docker",
  "JWT",
  "REST",
  "GraphQL",
  "Prisma",
  "CORS",
  "SQL",
  "DevOps",
];

const heroStats = [
  { value: "400+", label: "Términos explicados" },
  { value: "120+", label: "Cursos enlazados" },
  { value: "24/7", label: "Actualizaciones" },
];

const learningPillars = [
  { title: "Stack preferido", detail: "Next.js + TypeScript + Tailwind" },
  { title: "Arquitectura", detail: "Clean Architecture, SOLID, DDD" },
  { title: "Automatización", detail: "Prisma, Docker, CI/CD listo para prod" },
];

const keywordMatch = (title: string, keywords: string[]) => keywords.some(keyword => title.includes(keyword));

const courseIconDictionary: Array<{ keywords: string[]; Icon: IconType }> = [
  { keywords: ["tailwind"], Icon: SiTailwindcss },
  { keywords: ["sass"], Icon: FaCss3Alt },
  { keywords: ["html"], Icon: FaHtml5 },
  { keywords: ["css", "maquetación", "responsive", "grid", "diseño"], Icon: FaCss3Alt },
  { keywords: ["redux"], Icon: SiRedux },
  { keywords: ["testing librar"], Icon: SiTestinglibrary },
  { keywords: ["next"], Icon: SiNextdotjs },
  { keywords: ["nuxt"], Icon: SiNuxtdotjs },
  { keywords: ["vuex", "pinia", "vue"], Icon: FaVuejs },
  { keywords: ["angular"], Icon: FaAngular },
  { keywords: ["react", "vite", "jsx", "hooks", "state machines", "ssr"], Icon: FaReact },
  { keywords: ["laravel"], Icon: FaLaravel },
  { keywords: ["symfony"], Icon: SiSymfony },
  { keywords: ["php", "yii"], Icon: FaPhp },
  { keywords: ["graphql"], Icon: SiGraphql },
  { keywords: ["nest"], Icon: SiNestjs },
  { keywords: ["socket", "real time"], Icon: TbTopologyStar },
  { keywords: ["docker"], Icon: FaDocker },
  { keywords: ["git"], Icon: FaGitAlt },
  { keywords: ["historia", "innovación", "paradigma"], Icon: MdOutlineHistoryEdu },
  { keywords: ["typescript"], Icon: SiTypescript },
  { keywords: ["javascript", "ecmascript", "frontend developer", "pensamiento lógico", "computadores", "dom"], Icon: SiJavascript },
  { keywords: ["node", "express", "backend", "api rest"], Icon: FaNodeJs },
  { keywords: ["sql", "postgres", "mysql", "mariadb", "mongodb", "database", "prisma", "redis"], Icon: FaDatabase },
  { keywords: ["k6"], Icon: SiK6 },
  { keywords: ["performance", "observabilidad", "lighthouse"], Icon: MdSpeed },
  { keywords: ["testing", "debugging", "unit testing", "cypress"], Icon: MdScience },
  { keywords: ["auth", "oauth", "jwt", "seguridad", "auth0", "passport"], Icon: MdSecurity },
  { keywords: ["arquitectura", "patrones", "diagramas", "ddd"], Icon: BiSitemap },
  { keywords: ["design", "sistemas de diseño"], Icon: MdDesignServices },
  { keywords: ["python", "django", "fastapi", "flask", "algorítmica", "estructuras de datos"], Icon: FaPython },
  { keywords: ["azure"], Icon: VscAzureDevops },
  { keywords: ["c#", ".net", "blazor", "entity", "linq"], Icon: SiDotnet },
];

const getCourseIcon = (title: string): IconType => {
  const normalized = title.toLowerCase();
  const entry = courseIconDictionary.find(({ keywords }) => keywordMatch(normalized, keywords));
  return entry ? entry.Icon : FaCode;
};

const frontendCourses = [
  { title: "Fundamentos de Programación y Desarrollo Web", url: "https://www.notion.so/Fundamentos-de-Programaci-n-y-Desarrollo-Web-186ea313c5008149b337e3c709164718?pvs=21" },
  { title: "Curso Básico de Computadores e Informática", url: "https://www.notion.so/Curso-B-sico-de-Computadores-e-Inform-tica-186ea313c500817d9d2beee99291d966?pvs=21" },
  { title: "Curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo", url: "https://www.notion.so/Curso-de-Pensamiento-L-gico-Algoritmos-y-Diagramas-de-Flujo-186ea313c5008158a79af13e13005c0b?pvs=21" },
  { title: "Curso de Pensamiento Lógico: Manejo de Datos, Estructuras y Funciones", url: "https://www.notion.so/Curso-de-Pensamiento-L-gico-Manejo-de-Datos-Estructuras-y-Funciones-186ea313c50081548f91c7539cb326f8?pvs=21" },
  { title: "Curso de Pensamiento Lógico: Lenguajes de Programación", url: "https://www.notion.so/Curso-de-Pensamiento-L-gico-Lenguajes-de-Programaci-n-186ea313c50081dda5e3cf9def3b5d92?pvs=21" },
  { title: "Desafíos de Pensamiento Lógico", url: "https://www.notion.so/Desaf-os-de-Pensamiento-L-gico-186ea313c50081d98037d706f54c690c?pvs=21" },
  { title: "Fundamentos de Ingeniería de Software [Empieza Gratis]", url: "https://www.notion.so/Fundamentos-de-Ingenier-a-de-Software-Empieza-Gratis-186ea313c500818293c9fdda01e82b33?pvs=21" },
  { title: "Curso Gratis de Programación Básica", url: "https://www.notion.so/Curso-Gratis-de-Programaci-n-B-sica-186ea313c5008190831cff067ff51951?pvs=21" },
  { title: "Curso de Git y GitHub", url: "https://www.notion.so/Curso-de-Git-y-GitHub-186ea313c500811e8c1ed7ffa8f62442?pvs=21" },
  { title: "Curso de Historia de la Programación: Lenguajes y Paradigmas", url: "https://www.notion.so/Curso-de-Historia-de-la-Programaci-n-Lenguajes-y-Paradigmas-187ea313c50081218806e2d45f8f15a3?pvs=21" },
  { title: "Curso de Introducción a la Web: Historia y Funcionamiento de Internet", url: "https://www.notion.so/Curso-de-Introducci-n-a-la-Web-Historia-y-Funcionamiento-de-Internet-187ea313c5008112a124d714bd8954ba?pvs=21" },
  { title: "Curso de Historia de la Innovación y el Emprendimiento", url: "https://www.notion.so/Curso-de-Historia-de-la-Innovaci-n-y-el-Emprendimiento-187ea313c50081b2b93cc9685f953c23?pvs=21" },
  { title: "Curso de Frontend Developer", url: "https://www.notion.so/Curso-de-Frontend-Developer-187ea313c50081108009e34c96502be2?pvs=21" },
  { title: "Curso Práctico de Frontend Developer", url: "https://www.notion.so/Curso-Pr-ctico-de-Frontend-Developer-187ea313c5008117af71d89afe0fa97a?pvs=21" },
  { title: "Curso de HTML y CSS", url: "https://www.notion.so/Curso-de-HTML-y-CSS-188ea313c500814d8a4afeac71aab5fc?pvs=21" },
  { title: "Curso Práctico de HTML y CSS", url: "https://www.notion.so/Curso-Pr-ctico-de-HTML-y-CSS-189ea313c500816b8cf5c458c1d9e574?pvs=21" },
  { title: "Curso de Responsive Design: Maquetación Mobile First", url: "https://www.notion.so/Curso-de-Responsive-Design-Maquetaci-n-Mobile-First-189ea313c500816e96a9df6ff76b2690?pvs=21" },
  { title: "Curso de Fundamentos de Sass | Platzi", url: "https://www.notion.so/Curso-de-Fundamentos-de-Sass-Platzi-189ea313c50081cf8834e260c335398a?pvs=21" },
  { title: "Curso de Diseño para Programadores", url: "https://www.notion.so/Curso-de-Dise-o-para-Programadores-189ea313c500815bb891d33b015e0c68?pvs=21" },
  { title: "Curso de Sistemas de Diseño Efectivos", url: "https://www.notion.so/Curso-de-Sistemas-de-Dise-o-Efectivos-189ea313c50081e7b7ecdd3f3e324104?pvs=21" },
  { title: "Curso de CSS Grid Básico", url: "https://www.notion.so/Curso-de-CSS-Grid-B-sico-189ea313c50081869cefc54ac935503e?pvs=21" },
  { title: "Curso Práctico de Maquetación en CSS", url: "https://www.notion.so/Curso-Pr-ctico-de-Maquetaci-n-en-CSS-18aea313c50081189e73ce7696301790?pvs=21" },
  { title: "Curso Profesional de CSS Grid Layout", url: "https://www.notion.so/Curso-Profesional-de-CSS-Grid-Layout-18aea313c500814aa3ebfbc8ea3183dd?pvs=21" },
  { title: "Curso de Diseño Web con CSS Grid y Flexbox", url: "https://www.notion.so/Curso-de-Dise-o-Web-con-CSS-Grid-y-Flexbox-18aea313c50081c3a2b2dcda650e9a9d?pvs=21" },
  { title: "Curso de Arquitecturas CSS", url: "https://www.notion.so/Curso-de-Arquitecturas-CSS-18aea313c500817fb2f8efd71176c2cc?pvs=21" },
  { title: "Curso Básico de Tailwind 2 y 3", url: "https://www.notion.so/Curso-B-sico-de-Tailwind-2-y-3-18aea313c50081ac8117e2df2fe23898?pvs=21" },
  { title: "Curso de Transformaciones y Transiciones en CSS", url: "https://www.notion.so/Curso-de-Transformaciones-y-Transiciones-en-CSS-18bea313c500818faeabf9e2ebc94d9d?pvs=21" },
  { title: "Curso de Animaciones con CSS", url: "https://www.notion.so/Curso-de-Animaciones-con-CSS-18bea313c500813f9686cc0f3c635606?pvs=21" },
  { title: "Curso de JavaScript: Manipulación del DOM", url: "https://www.notion.so/Curso-de-JavaScript-Manipulaci-n-del-DOM-18bea313c50081a59e09d7c7af4e601a?pvs=21" },
  { title: "Curso de API REST con Javascript: Fundamentos", url: "https://www.notion.so/Curso-de-API-REST-con-Javascript-Fundamentos-18bea313c50081deab4cfd87899ad04c?pvs=21" },
  { title: "Curso de API REST con Javascript: Ejemplos con APIs reales", url: "https://www.notion.so/Curso-de-API-REST-con-Javascript-Ejemplos-con-APIs-reales-18bea313c50081f29579e77e8000dc48?pvs=21" },
  { title: "Curso de API REST con Javascript: Performance y Usabilidad", url: "https://www.notion.so/Curso-de-API-REST-con-Javascript-Performance-y-Usabilidad-18cea313c50081e49fc2fc2eac2b0090?pvs=21" },
  { title: "Curso de JavaScript Web Components", url: "https://www.notion.so/Curso-de-JavaScript-Web-Components-18cea313c50081958bf2d43866ff2ebe?pvs=21" },
  { title: "Curso de Debugging con Chrome DevTools", url: "https://www.notion.so/Curso-de-Debugging-con-Chrome-DevTools-18cea313c50081b98df1eba4206b2d26?pvs=21" },
  { title: "Curso de Introducción al Testing con JavaScript", url: "https://www.notion.so/Curso-de-Introducci-n-al-Testing-con-JavaScript-18cea313c5008103b11bff83c1938c32?pvs=21" },
  { title: "Curso de Frameworks y Librerías de JavaScript", url: "https://www.notion.so/Curso-de-Frameworks-y-Librer-as-de-JavaScript-18cea313c500816181dccf6e9277edc6?pvs=21" },
  { title: "Audiocurso de Frameworks y Arquitecturas Frontend: Casos de Estudio", url: "https://www.notion.so/Audiocurso-de-Frameworks-y-Arquitecturas-Frontend-Casos-de-Estudio-18cea313c50081b5bb2de2be26bcd30a?pvs=21" },
  { title: "Curso de React.js", url: "https://www.notion.so/Curso-de-React-js-18cea313c5008193bdf9f26ad9937264?pvs=21" },
  { title: "Curso de React.js con Vite.js y TailwindCSS", url: "https://www.notion.so/Curso-de-React-js-con-Vite-js-y-TailwindCSS-18dea313c5008181b7cbea6ab8d3d216?pvs=21" },
  { title: "Prueba Técnica: E-commerce Profesional con React.js", url: "https://www.notion.so/Prueba-T-cnica-E-commerce-Profesional-con-React-js-18dea313c5008112967fd85291331701?pvs=21" },
  { title: "Curso de React.js Patrones de Render y Composición", url: "https://www.notion.so/Curso-de-React-js-Patrones-de-Render-y-Composici-n-18dea313c50081af83e2faf5e9214329?pvs=21" },
  { title: "Curso de React.js Manejo Profesional del Estado", url: "https://www.notion.so/Curso-de-React-js-Manejo-Profesional-del-Estado-18dea313c50081528541d5b169610cfc?pvs=21" },
  { title: "Curso de React.js Navegación con React Router", url: "https://www.notion.so/Curso-de-React-js-Navegaci-n-con-React-Router-18eea313c5008189a475cd652672ed70?pvs=21" },
  { title: "Curso de State Machines en React.js", url: "https://www.notion.so/Curso-de-State-Machines-en-React-js-18eea313c500816db7b5f2840334cf27?pvs=21" },
  { title: "Curso Profesional de React.js y Redux", url: "https://www.notion.so/Curso-Profesional-de-React-js-y-Redux-18eea313c500814e9539c32c11a35e22?pvs=21" },
  { title: "Curso de React.js con TypeScript", url: "https://www.notion.so/Curso-de-React-js-con-TypeScript-18eea313c5008182929eef75073c35d7?pvs=21" },
  { title: "Curso de Server Side Render o SSR con React.js", url: "https://www.notion.so/Curso-de-Server-Side-Render-o-SSR-con-React-js-18eea313c5008176be50dd1a8e2982d8?pvs=21" },
  { title: "Curso de React Avanzado", url: "https://www.notion.so/Curso-de-React-Avanzado-18eea313c500819da33ec666678df8ac?pvs=21" },
  { title: "Curso de Next.js Avanzado", url: "https://www.notion.so/Curso-de-Next-js-Avanzado-190ea313c50081be8511c8befd7d64af?pvs=21" },
  { title: "Curso de React Testing Librar", url: "https://www.notion.so/Curso-de-React-Testing-Librar-191ea313c50081489a00cb7a9217a63c?pvs=21" },
  { title: "Curso de Vue.js: Introducción y Fundamentos", url: "https://www.notion.so/Curso-de-Vue-js-Introducci-n-y-Fundamentos-191ea313c50081b09a1adf43b32ccc63?pvs=21" },
  { title: "Curso de Vue.js: Componentes y Composition API", url: "https://www.notion.so/Curso-de-Vue-js-Componentes-y-Composition-API-192ea313c50081179599d59e958b7502?pvs=21" },
  { title: "Curso Práctico de Vue.js", url: "https://www.notion.so/Curso-Pr-ctico-de-Vue-js-192ea313c50081988648ead130089def?pvs=21" },
  { title: "Curso de Vue.js: Navegación con Vue Router", url: "https://www.notion.so/Curso-de-Vue-js-Navegaci-n-con-Vue-Router-192ea313c50081a9b499f6a94cf32aa0?pvs=21" },
  { title: "Curso de Vue.js: Manejo del Estado con Vuex", url: "https://www.notion.so/Curso-de-Vue-js-Manejo-del-Estado-con-Vuex-192ea313c500815fafcbd5eb70ef2fa8?pvs=21" },
  { title: "Curso de Vue.js Manejo del Estado con Pinia", url: "https://www.notion.so/Curso-de-Vue-js-Manejo-del-Estado-con-Pinia-193ea313c5008182bf94d70d1e517399?pvs=21" },
  { title: "Curso de Unit Testing en Vue.js 3", url: "https://www.notion.so/Curso-de-Unit-Testing-en-Vue-js-3-193ea313c5008182994ce65a430229e7?pvs=21" },
  { title: "Curso de Reactividad con Vue.js 3", url: "https://www.notion.so/Curso-de-Reactividad-con-Vue-js-3-193ea313c50081b5873bd8b0d0b88ce9?pvs=21" },
  { title: "Curso Básico de Vue.js 2", url: "https://www.notion.so/Curso-B-sico-de-Vue-js-2-195ea313c50081a98024c27e7595393f?pvs=21" },
  { title: "Curso Profesional de Vue.js 2", url: "https://www.notion.so/Curso-Profesional-de-Vue-js-2-195ea313c5008181b67ec305a850e3de?pvs=21" },
  { title: "Curso Avanzado de Vue.js 2", url: "https://www.notion.so/Curso-Avanzado-de-Vue-js-2-196ea313c50081b0968cea9b3f698470?pvs=21" },
  { title: "Curso de Testing con Vue.js 2", url: "https://www.notion.so/Curso-de-Testing-con-Vue-js-2-196ea313c50081fa9e95ceb8f7e62bd6?pvs=21" },
  { title: "Curso de Server Side Rendering con Nuxt 2", url: "https://www.notion.so/Curso-de-Server-Side-Rendering-con-Nuxt-2-196ea313c500817ea550ced045dc33a7?pvs=21" },
  { title: "Curso de Single Page Applications en Laravel con Inertia y Vue.js", url: "https://www.notion.so/Curso-de-Single-Page-Applications-en-Laravel-con-Inertia-y-Vue-js-197ea313c50081bab821e3fc37a82c96?pvs=21" },
  { title: "Curso de Angular 17: Creación de Aplicaciones Web", url: "https://www.notion.so/Curso-de-Angular-17-Creaci-n-de-Aplicaciones-Web-197ea313c500814d8e18e3a8a326f559?pvs=21" },
  { title: "Prueba Técnica Desarrollo Frontend con Angular", url: "https://www.notion.so/Prueba-T-cnica-Desarrollo-Frontend-con-Angular-199ea313c50081429917c914ed293274?pvs=21" },
  { title: "Curso de Maquetación con Angular CDK y Tailwind CSS", url: "https://www.notion.so/Curso-de-Maquetaci-n-con-Angular-CDK-y-Tailwind-CSS-199ea313c50081868701eaa443a9f0ff?pvs=21" },
  { title: "Curso de Autenticación con Angular", url: "https://www.notion.so/Curso-de-Autenticaci-n-con-Angular-199ea313c50081c9adb9d57870fd4c89?pvs=21" },
  { title: "Curso Práctico de Angular Construye un Clon de Trello", url: "https://www.notion.so/Curso-Pr-ctico-de-Angular-Construye-un-Clon-de-Trello-199ea313c50081fc8e45fda960a1146e?pvs=21" },
  { title: "Laboratorio de Angular Optimización Web con Lighthouse y SSR", url: "https://www.notion.so/Laboratorio-de-Angular-Optimizaci-n-Web-con-Lighthouse-y-SSR-19aea313c5008105a017d1ffdd43e4bd?pvs=21" },
  { title: "Curso de Angular: Unit Testing para Servicios", url: "https://www.notion.so/Curso-de-Angular-Unit-Testing-para-Servicios-19aea313c5008186ac87f57954cbe360?pvs=21" },
  { title: "Curso de Angular: Unit Testing para Componentes", url: "https://www.notion.so/Curso-de-Angular-Unit-Testing-para-Componentes-19aea313c500813381bcc76a02cedea6?pvs=21" },
  { title: "Curso de Angular: Unit Testing para Formularios", url: "https://www.notion.so/Curso-de-Angular-Unit-Testing-para-Formularios-19aea313c5008175aab6c1d8e1ff3df7?pvs=21" },
  { title: "Curso de Angular: Unit Testing para Rutas", url: "https://www.notion.so/Curso-de-Angular-Unit-Testing-para-Rutas-19bea313c50081e0a11dded39a03ab41?pvs=21" },
] as const;

const backendCourses = [
  { title: "Curso de Introducción al Desarrollo Backend", url: "https://www.notion.so/Curso-de-Introducci-n-al-Desarrollo-Backend-19dea313c50081f39b11c6dcdb34449d?pvs=21" },
  { title: "Curso de Fundamentos de Bases de Datos", url: "https://www.notion.so/Curso-de-Fundamentos-de-Bases-de-Datos-19dea313c500819d8a36c9926b022267?pvs=21" },
  { title: "Curso de SQL y MySQL", url: "https://www.notion.so/Curso-de-SQL-y-MySQL-19dea313c500817fafbbe53b794e4c83?pvs=21" },
  { title: "Curso de Bases de Datos con MySQL y MariaDB", url: "https://www.notion.so/Curso-de-Bases-de-Datos-con-MySQL-y-MariaDB-19eea313c500816d9de2d8cd5b1908b4?pvs=21" },
  { title: "Curso de PostgreSQL", url: "https://www.notion.so/Curso-de-PostgreSQL-19fea313c50081df8affe72c4ac7182c?pvs=21" },
  { title: "Curso Práctico de SQL", url: "https://www.notion.so/Curso-Pr-ctico-de-SQL-1a0ea313c5008146a4b5dec133a07cd4?pvs=21" },
  { title: "Curso de Optimización de Bases de Datos en SQL Server", url: "https://www.notion.so/Curso-de-Optimizaci-n-de-Bases-de-Datos-en-SQL-Server-1a2ea313c5008192824eefd5daec6282?pvs=21" },
  { title: "Curso de Base de Datos No Relacionales", url: "https://www.notion.so/Curso-de-Base-de-Datos-No-Relacionales-1a3ea313c50081e29ff7e5145008f801?pvs=21" },
  { title: "Curso de Introducción a MongoDB", url: "https://www.notion.so/Curso-de-Introducci-n-a-MongoDB-1a3ea313c50081dbb46ad424703bcff6?pvs=21" },
  { title: "Curso de Modelado de Datos en MongoDB", url: "https://www.notion.so/Curso-de-Modelado-de-Datos-en-MongoDB-1a3ea313c500811f9632dda1ab3c62a9?pvs=21" },
  { title: "Curso de Expresiones Regulares", url: "https://www.notion.so/Curso-de-Expresiones-Regulares-1a3ea313c50081d880b0f250a7260faf?pvs=21" },
  { title: "Curso de MongoDB: Aggregation Framework", url: "https://www.notion.so/Curso-de-MongoDB-Aggregation-Framework-1a5ea313c50081d6a05ff057cf99313a?pvs=21" },
  { title: "Fundamentos de Arquitectura de Software", url: "https://www.notion.so/Fundamentos-de-Arquitectura-de-Software-1a5ea313c5008137836ac67c1bedd4fc?pvs=21" },
  { title: "Curso Profesional de Arquitectura de Software", url: "https://www.notion.so/Curso-Profesional-de-Arquitectura-de-Software-1a5ea313c50081d09695e4cfc267bb0e?pvs=21" },
  { title: "Curso de Arquitecturas Limpias para Desarrollo de Software", url: "https://www.notion.so/Curso-de-Arquitecturas-Limpias-para-Desarrollo-de-Software-1a5ea313c5008106ba99d2c3a088517b?pvs=21" },
  { title: "Curso Práctico de Arquitectura Backend", url: "https://www.notion.so/Curso-Pr-ctico-de-Arquitectura-Backend-1a5ea313c5008184a4c4c55f5fa82c87?pvs=21" },
  { title: "Audiocurso de Fundamentos de Arquitectura de Alta Concurrencia", url: "https://www.notion.so/Audiocurso-de-Fundamentos-de-Arquitectura-de-Alta-Concurrencia-1a5ea313c50081eb8fdceed19fbd81e0?pvs=21" },
  { title: "Curso de Introducción a los Patrones de Diseño de Software", url: "https://www.notion.so/Curso-de-Introducci-n-a-los-Patrones-de-Dise-o-de-Software-1a6ea313c5008141a5eed203c7980f53?pvs=21" },
  { title: "Curso de Estándares y Buenas Prácticas para API REST con Laravel", url: "https://www.notion.so/Curso-de-Est-ndares-y-Buenas-Pr-cticas-para-API-REST-con-Laravel-1a6ea313c50081f88bffe3d3551d60d2?pvs=21" },
  { title: "Curso de Docker Avanzado", url: "https://www.notion.so/Curso-de-Docker-Avanzado-1a7ea313c5008103b0f6fa4892547b77?pvs=21" },
  { title: "Curso de ECMAScript: Historia y Versiones de JavaScript", url: "https://www.notion.so/Curso-de-ECMAScript-Historia-y-Versiones-de-JavaScript-1a7ea313c50081598a63ded75910d062?pvs=21" },
  { title: "Curso de Fundamentos de Node.js", url: "https://www.notion.so/Curso-de-Fundamentos-de-Node-js-1a7ea313c50081608ad7c349b3a50f40?pvs=21" },
  { title: "Curso de Backend con Node.js API REST con Express.js", url: "https://www.notion.so/Curso-de-Backend-con-Node-js-API-REST-con-Express-js-1a7ea313c500811fbc5afb50a711eb45?pvs=21" },
  { title: "Curso de Backend con Node.js Base de Datos con PostgreSQL", url: "https://www.notion.so/Curso-de-Backend-con-Node-js-Base-de-Datos-con-PostgreSQL-1a8ea313c5008153b081cb38a0ec1380?pvs=21" },
  { title: "Curso de Backend con Node.js: Autenticación con Passport.js y JWT", url: "https://www.notion.so/Curso-de-Backend-con-Node-js-Autenticaci-n-con-Passport-js-y-JWT-1a8ea313c5008141b473ea0796b7e685?pvs=21" },
  { title: "Curso de Node.js Autenticación, Microservicios y Redis", url: "https://www.notion.so/Curso-de-Node-js-Autenticaci-n-Microservicios-y-Redis-1abea313c50081df972bc45055e95cca?pvs=21" },
  { title: "Curso de OAuth 2.0 y OpenID Connect Flujos de Autenticación y Casos de Estudio", url: "https://www.notion.so/Curso-de-OAuth-2-0-y-OpenID-Connect-Flujos-de-Autenticaci-n-y-Casos-de-Estudio-1abea313c50081ba8f9ef66c7fc188b1?pvs=21" },
  { title: "Curso de Auth0: Implementación de Autenticación y Seguridad Web", url: "https://www.notion.so/Curso-de-Auth0-Implementaci-n-de-Autenticaci-n-y-Seguridad-Web-1acea313c5008128be3cc11114dc3c36?pvs=21" },
  { title: "Laboratorio de Node.js Autenticación y Seguridad", url: "https://www.notion.so/Laboratorio-de-Node-js-Autenticaci-n-y-Seguridad-1acea313c5008176b991dc72e674b8fd?pvs=21" },
  { title: "Curso de Introducción al Testing con JavaScript", url: "https://www.notion.so/Curso-de-Introducci-n-al-Testing-con-JavaScript-1acea313c5008059add4e05fc464e5bf?pvs=21" },
  { title: "Curso de End to End Testing para APIs REST con Node.js", url: "https://www.notion.so/Curso-de-End-to-End-Testing-para-APIs-REST-con-Node-js-1acea313c50081ec82a1d9e239d89368?pvs=21" },
  { title: "Curso de Performance Testing en Node.js con K6", url: "https://www.notion.so/Curso-de-Performance-Testing-en-Node-js-con-K6-1adea313c500812c97e3c26f3aa8af33?pvs=21" },
  { title: "Curso de Fundamentos de Observabilidad con New Relic", url: "https://www.notion.so/Curso-de-Fundamentos-de-Observabilidad-con-New-Relic-1adea313c5008100a7c6ea8622cd2904?pvs=21" },
  { title: "Curso de Automatización de Pruebas de Backend con Cypress", url: "https://www.notion.so/Curso-de-Automatizaci-n-de-Pruebas-de-Backend-con-Cypress-1adea313c50081d98ec8fbb2a60dd2fc?pvs=21" },
  { title: "Curso de GraphQL con Node.js", url: "https://www.notion.so/Curso-de-GraphQL-con-Node-js-1aeea313c50081609978e9aa8b6ca75a?pvs=21" },
  { title: "Curso Avanzado de Node.js con GraphQL, Apollo Server y Prisma", url: "https://www.notion.so/Curso-Avanzado-de-Node-js-con-GraphQL-Apollo-Server-y-Prisma-1aeea313c50081b69e7fc68c9876ac24?pvs=21" },
  { title: "Curso de Aplicaciones en Tiempo Real con Socket.io", url: "https://www.notion.so/Curso-de-Aplicaciones-en-Tiempo-Real-con-Socket-io-1afea313c500814bb478f83898d35e79?pvs=21" },
  { title: "Laboratorio de Node.js Clon de Calendly", url: "https://www.notion.so/Laboratorio-de-Node-js-Clon-de-Calendly-1b0ea313c5008120b75febd99b6b53c6?pvs=21" },
  { title: "Curso de Backend con NestJS", url: "https://www.notion.so/Curso-de-Backend-con-NestJS-1b0ea313c50081a1a300f2335cb72cf5?pvs=21" },
  { title: "Curso de NestJS Programación Modular, Documentación con Swagger y Deploy", url: "https://www.notion.so/Curso-de-NestJS-Programaci-n-Modular-Documentaci-n-con-Swagger-y-Deploy-1b0ea313c50081cd9054eab59dd4f2b7?pvs=21" },
  { title: "Curso de NestJS Persistencia de Datos con TypeORM", url: "https://www.notion.so/Curso-de-NestJS-Persistencia-de-Datos-con-TypeORM-1b0ea313c5008134b069e9c690925349?pvs=21" },
  { title: "Curso de NestJS Persistencia de Datos con MongoDB", url: "https://www.notion.so/Curso-de-NestJS-Persistencia-de-Datos-con-MongoDB-1b0ea313c5008172a8f0c5f2ec88c569?pvs=21" },
  { title: "Curso de NestJS Autenticación con Passport y JWT", url: "https://www.notion.so/Curso-de-NestJS-Autenticaci-n-con-Passport-y-JWT-1b0ea313c500810ab656df6f359d86f9?pvs=21" },
  { title: "Curso de Python", url: "https://www.notion.so/Curso-de-Python-1b2ea313c5008195872bf018df032088?pvs=21" },
  { title: "Curso de Python Comprehensions, Funciones y Manejo de Errores", url: "https://www.notion.so/Curso-de-Python-Comprehensions-Funciones-y-Manejo-de-Errores-1b3ea313c50081a384fafc2ca6a222f4?pvs=21" },
  { title: "Curso de Python: PIP y Entornos Virtuales", url: "https://www.notion.so/Curso-de-Python-PIP-y-Entornos-Virtuales-1baea313c500814da974ccd6efd46731?pvs=21" },
  { title: "Curso de Unit Testing en Python", url: "https://www.notion.so/Curso-de-Unit-Testing-en-Python-1bbea313c50081559f86ec310f2199a9?pvs=21" },
  { title: "Curso de Patrones de Diseño y SOLID en Python", url: "https://www.notion.so/Curso-de-Patrones-de-Dise-o-y-SOLID-en-Python-1bcea313c50081c2939bea8ac56f9bbe?pvs=21" },
  { title: "Curso de Django", url: "https://www.notion.so/Curso-de-Django-1c2ea313c50081fcb493fc47a1540ac9?pvs=21" },
  { title: "Curso de Django Rest Framework", url: "https://www.notion.so/Curso-de-Django-Rest-Framework-1c4ea313c50081f4b7bbeae71cd4fa5c?pvs=21" },
  { title: "Curso de FastAPI", url: "https://www.notion.so/Curso-de-FastAPI-1c4ea313c5008163a528eda11a548596?pvs=21" },
  { title: "Curso de Flask", url: "https://www.notion.so/Curso-de-Flask-1c4ea313c50081a0ac5fd000e4499a59?pvs=21" },
  { title: "Curso de Complejidad Algorítmica con Python", url: "https://www.notion.so/Curso-de-Complejidad-Algor-tmica-con-Python-1c6ea313c500816f9fc0ea588c53a625?pvs=21" },
  { title: "Curso de Estructuras de Datos Lineales con Python", url: "https://www.notion.so/Curso-de-Estructuras-de-Datos-Lineales-con-Python-1c6ea313c50081ba8c4ad24cd75260d1?pvs=21" },
  { title: "Curso Básico de PHP: Instalación, Fundamentos y Operadores", url: "https://www.notion.so/Curso-B-sico-de-PHP-Instalaci-n-Fundamentos-y-Operadores-1c6ea313c50081299dabeec21144c0a1?pvs=21" },
  { title: "Curso de PHP: Arreglos, Funciones y Estructuras de Control", url: "https://www.notion.so/Curso-de-PHP-Arreglos-Funciones-y-Estructuras-de-Control-1c6ea313c5008108852aca41be1d5003?pvs=21" },
  { title: "Curso Práctico de PHP", url: "https://www.notion.so/Curso-Pr-ctico-de-PHP-1c7ea313c5008181b4e9c4e09b5c0d32?pvs=21" },
  { title: "Curso de PHP: Integración con HTML", url: "https://www.notion.so/Curso-de-PHP-Integraci-n-con-HTML-1c7ea313c5008126abc0e9388c66f974?pvs=21" },
  { title: "Curso de PHP con Composer", url: "https://www.notion.so/Curso-de-PHP-con-Composer-1c9ea313c5008168a654f0035688370f?pvs=21" },
  { title: "Curso de Manejo de Datos en PHP", url: "https://www.notion.so/Curso-de-Manejo-de-Datos-en-PHP-1caea313c5008148b29eefab3bde46e1?pvs=21" },
  { title: "Curso de Programación Orientada a Objetos en PHP", url: "https://www.notion.so/Curso-de-Programaci-n-Orientada-a-Objetos-en-PHP-1d0ea313c500818c902bfa3c7d423728?pvs=21" },
  { title: "Curso de PHP: Entornos Virtuales y Funciones Avanzadas", url: "https://www.notion.so/Curso-de-PHP-Entornos-Virtuales-y-Funciones-Avanzadas-1d0ea313c500816d8ad0c03198dbccbb?pvs=21" },
  { title: "Curso de PHP Cookies, Sesiones y Modularización", url: "https://www.notion.so/Curso-de-PHP-Cookies-Sesiones-y-Modularizaci-n-1d1ea313c5008151a670da1d7f0dfd34?pvs=21" },
  { title: "Curso de PHP Bases de Datos", url: "https://www.notion.so/Curso-de-PHP-Bases-de-Datos-1d1ea313c500814ea95cf72b47f29e34?pvs=21" },
  { title: "Curso de Introducción a Frameworks de PHP", url: "https://www.notion.so/Curso-de-Introducci-n-a-Frameworks-de-PHP-1d2ea313c50081bab828d78335b2b88d?pvs=21" },
  { title: "Curso de Desarrollo Web con PHP y Yii2", url: "https://www.notion.so/Curso-de-Desarrollo-Web-con-PHP-y-Yii2-1d2ea313c5008183ac64f5412683a60c?pvs=21" },
  { title: "Curso de Introducción a Laravel 9", url: "https://www.notion.so/Curso-de-Introducci-n-a-Laravel-9-1d2ea313c50081189d41c89518f98822?pvs=21" },
  { title: "Curso Básico de Testing con PHP y Laravel", url: "https://www.notion.so/Curso-B-sico-de-Testing-con-PHP-y-Laravel-1d3ea313c50081379824f85fec00f18b?pvs=21" },
  { title: "Curso de Desarrollo en Laravel con Test Driven Development", url: "https://www.notion.so/Curso-de-Desarrollo-en-Laravel-con-Test-Driven-Development-1d3ea313c50081f78aece753f0dab681?pvs=21" },
  { title: "Curso de Interfaces Dinámicas con Laravel Livewire", url: "https://www.notion.so/Curso-de-Interfaces-Din-micas-con-Laravel-Livewire-1d3ea313c50081828f74db069fa9f124?pvs=21" },
  { title: "Curso de API REST con Laravel", url: "https://www.notion.so/Curso-de-API-REST-con-Laravel-1d3ea313c5008126a5e9da4fecd8c83d?pvs=21" },
  { title: "Curso de Fundamentos de Symfony 6", url: "https://www.notion.so/Curso-de-Fundamentos-de-Symfony-6-1d3ea313c50081c1bb32d7b898233246?pvs=21" },
  { title: "Curso de Symfony 6 Formularios", url: "https://www.notion.so/Curso-de-Symfony-6-Formularios-1d3ea313c50081a699cae9f140eb79d0?pvs=21" },
  { title: "Curso de Symfony 6: Creación de API REST", url: "https://www.notion.so/Curso-de-Symfony-6-Creaci-n-de-API-REST-1d4ea313c500814abc76e29c638c893f?pvs=21" },
  { title: "Curso de Bases de Datos en Symfony", url: "https://www.notion.so/Curso-de-Bases-de-Datos-en-Symfony-1d4ea313c5008142b4c4d58111299da9?pvs=21" },
  { title: "Curso Práctico de Symfony", url: "https://www.notion.so/Curso-Pr-ctico-de-Symfony-1d4ea313c500815896d5c75db6ca0808?pvs=21" },
  { title: "Curso Básico de Programación con C#", url: "https://www.notion.so/Curso-B-sico-de-Programaci-n-con-C-1d4ea313c5008151ae4ed47b5e8a2f10?pvs=21" },
  { title: "Curso de Programación Orientada a Objetos con C#", url: "https://www.notion.so/Curso-de-Programaci-n-Orientada-a-Objetos-con-C-1d4ea313c500819fa136fa2fa6edcb88?pvs=21" },
  { title: "Curso de Buenas Prácticas y Código Limpio en C#", url: "https://www.notion.so/Curso-de-Buenas-Pr-cticas-y-C-digo-Limpio-en-C-1d4ea313c50081beb85adf5f66277659?pvs=21" },
  { title: "Curso de Principios SOLID en C# y .NET", url: "https://www.notion.so/Curso-de-Principios-SOLID-en-C-y-NET-1d4ea313c50081aeb7c5f99d73b67f4f?pvs=21" },
  { title: "Curso de Manejo de Datos en C# con LINQ", url: "https://www.notion.so/Curso-de-Manejo-de-Datos-en-C-con-LINQ-1d4ea313c5008147b712c4eac7142bc0?pvs=21" },
  { title: "Curso de Fundamentos de .NET", url: "https://www.notion.so/Curso-de-Fundamentos-de-NET-1d4ea313c50081caaa5bf6b7fc6ddc94?pvs=21" },
  { title: "Curso de Fundamentos de Entity Framework", url: "https://www.notion.so/Curso-de-Fundamentos-de-Entity-Framework-1d4ea313c50081c9b7c8e531c51bb970?pvs=21" },
  { title: "Curso de APIs con .NET", url: "https://www.notion.so/Curso-de-APIs-con-NET-1d4ea313c5008196971af243b7e4b4b9?pvs=21" },
  { title: "Curso de Unit Testing con C# y .NET", url: "https://www.notion.so/Curso-de-Unit-Testing-con-C-y-NET-1d5ea313c50081af8057f511fbab87d3?pvs=21" },
  { title: "Curso de Aplicaciones Web con Blazor WebAssembly y .NET", url: "https://www.notion.so/Curso-de-Aplicaciones-Web-con-Blazor-WebAssembly-y-NET-1d5ea313c50081fb8d00d9062ee8f563?pvs=21" },
  { title: "Curso de Azure DevOps: Flujos de CI/CD", url: "https://www.notion.so/Curso-de-Azure-DevOps-Flujos-de-CI-CD-1d5ea313c5008149b277cdcd7fdeea42?pvs=21" },
] as const;

const specializationSections = [
  { title: "Especialización Frontend Developer", courses: frontendCourses, accent: "#8f7dff" },
  { title: "Especialización Backend Developer", courses: backendCourses, accent: "#5cf4ff" },
] as const;

export default function Page() {
  const lastUpdated = new Date().toLocaleDateString("es-ES");

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <section className="hero-card" style={{ margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 26px rgba(61,107,255,.45)" }}>
                <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Diccionario de confianza</p>
                <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: "-1px" }}>Diccionario Técnico Web</h1>
              </div>
            </div>
            <div className="hero-actions">
              <div className="hero-status">
                <span className="pill online">Online</span>
                <small>Base de datos al día: <b>{lastUpdated}</b></small>
              </div>
              <div className="button-row" style={{ marginTop: 14 }}>
                <a href="#search" className="btn-primary">Ir al buscador</a>
                <Link href="/admin" className="btn">Panel admin</Link>
              </div>
            </div>
          </section>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero-split">
          <div className="hero-content">
            <p className="hero-eyebrow">Base viva · {heroStats[0].value} recursos</p>
            <h2 className="hero-title">Diccionario Técnico Web</h2>
            <p className="hero-description">
              Encuentra definiciones claras, ejemplos reales y guías de implementación para dominar el stack moderno de desarrollo.
            </p>
            <div className="hero-chips">
              {techs.map(tech => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
            <div className="cta-row">
              <a href="#search" className="btn-primary-lg">
                Buscar un término
              </a>
              <Link href="#roadmap" className="btn-ghost-lg">
                Explorar roadmap
              </Link>
            </div>
          </div>
          <div className="hero-aside">
            <div className="hero-status-card">
              <span className="status-pill">Online</span>
              <small style={{ color: "rgba(255,255,255,.7)" }}>
                Base actualizada al día: <b>{lastUpdated}</b>
              </small>
              <small style={{ color: "rgba(255,255,255,.6)" }}>
                Glosario curado para Omar con prácticas listas para producción.
              </small>
            </div>
            <div className="stats-grid">
              {heroStats.map(item => (
                <div key={item.label} className="stats-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SearchBox />

        <section className="panel pillars-panel">
          <div>
            <p className="hero-eyebrow" style={{ marginBottom: 6 }}>Disciplina</p>
            <h3 style={{ margin: 0, fontSize: 28 }}>Pilares de aprendizaje</h3>
            <p className="sub" style={{ margin: 0, maxWidth: 520 }}>
              Lo esencial para mantenerte en forma como principal engineer. Stack, arquitectura y automatización listas para producción.
            </p>
          </div>
          <div className="pillars-grid">
            {learningPillars.map(pillar => (
              <div key={pillar.title} className="pillars-card">
                <span style={{ fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
                  {pillar.title}
                </span>
                <strong style={{ fontSize: 20 }}>{pillar.detail}</strong>
              </div>
            ))}
          </div>
        </section>

        <section id="roadmap" className="panel roadmap-panel">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p className="hero-eyebrow" style={{ marginBottom: 6 }}>Roadmap guiado</p>
              <h3 style={{ margin: 0, fontSize: 28 }}>Especializaciones disponibles</h3>
            </div>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>
              {frontendCourses.length + backendCourses.length} cursos curados
            </span>
          </div>
          <div style={{ display: "grid", gap: 28 }}>
            {specializationSections.map(section => (
              <div key={section.title} className="course-section">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <h4 style={{ color: section.accent, margin: 0, fontSize: 20, fontWeight: 800 }}>{section.title}</h4>
                  <span style={{ color: "rgba(230,233,239,.65)", fontSize: 13 }}>{section.courses.length} cursos</span>
                </div>
                <div className="course-grid">
                  {section.courses.map((course, index) => {
                    const Icon = getCourseIcon(course.title);
                    return (
                      <a
                        key={`${section.title}-${course.title}`}
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir curso ${course.title} en Notion`}
                        className="course-card"
                        style={{
                          borderColor: `${section.accent}33`,
                          background: "rgba(12,18,40,.92)",
                        }}
                      >
                        <div className="course-icon" style={{ background: `${section.accent}1a`, color: section.accent }}>
                          <Icon size={20} />
                        </div>
                        <div className="course-info">
                          <span className="course-title">
                            {index + 1}. {course.title}
                          </span>
                          <span className="course-meta">Abrir en Notion</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel tip-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>Tip:</span>
            <span style={{ color: "#e6e9ef", fontSize: 15 }}>
              Prueba términos como <code>fetch</code>, <code>useState</code>, <code>REST</code>, <code>JOIN</code>, <code>Docker</code>, <code>JWT</code>, <code>CORS</code>…
            </span>
          </div>
        </section>

        <section className="panel" style={{ alignItems: "flex-start", gap: 6 }}>
          <span style={{ color: "#8f7dff", fontWeight: 600, fontSize: 15 }}>
            Admin rápido:{" "}
            <Link href="/admin" style={{ color: "#5c7dff", textDecoration: "underline" }}>
              /admin
            </Link>
          </span>
          <small style={{ color: "rgba(255,255,255,.6)" }}>Administra términos, sesiones y catálogo desde un panel seguro.</small>
        </section>

        <footer className="site-footer">
          <div className="footer-waves" aria-hidden="true">
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="footer-wave">
              <path
                d="M0,160 C320,80 480,80 720,140 C960,200 1120,200 1440,120 L1440,0 L0,0 Z"
                fill="url(#footerGradPrimary)"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="footerGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5d80ff" />
                  <stop offset="100%" stopColor="#5cf4ff" />
                </linearGradient>
              </defs>
            </svg>
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="footer-wave footer-wave--front">
              <path
                d="M0,180 C280,140 480,200 720,150 C960,100 1150,140 1440,60 L1440,0 L0,0 Z"
                fill="url(#footerGradSecondary)"
                opacity="0.85"
              />
              <defs>
                <linearGradient id="footerGradSecondary" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5dff" />
                  <stop offset="100%" stopColor="#5cf4ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="footer-content">
            <div>
              <p className="hero-eyebrow" style={{ marginBottom: 10 }}>
                Tecnología sin límites
              </p>
              <h3>Diccionario Técnico Web</h3>
              <p>
                Conocimiento curado para equipos exigentes. Diseñado y operado por Omar Hernández Rey — Desarrollador web Full Stack.
              </p>
            </div>
            <div className="footer-meta">
              <span>© {new Date().getFullYear()} Omar Hernández Rey. Todos los derechos reservados.</span>
              <span>Stack: Next.js · Prisma · Docker · Infra 24/7</span>
            </div>
            <div className="footer-links">
              <a href="https://www.linkedin.com/in/omar-hernandez-rey/" target="_blank" rel="noopener noreferrer">
                <span className="footer-icon footer-icon--linkedin" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path
                      d="M5.2 3.5a2 2 0 1 1-.01 4 2 2 0 0 1 .01-4zM4 8.8h2.4v11.7H4V8.8zm5.3 0h2.3v1.6h.03c.32-.6 1.1-1.3 2.3-1.3 2.4 0 2.9 1.6 2.9 3.8v6.6H14V13c0-1.1 0-2.4-1.5-2.4-1.6 0-1.8 1.2-1.8 2.3v7.6H8.8V8.8z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span>LinkedIn</span>
              </a>
              <a href="https://github.com/omarhernandezrey" target="_blank" rel="noopener noreferrer">
                <span className="footer-icon footer-icon--github" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path
                      d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-3 .7-3.7-1.4-3.7-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.6.3-1.1.6-1.4-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.1 1-2.9-.1-.3-.4-1.4.1-2.8 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.5.1 2.8.6.8 1 1.7 1 2.9 0 4.2-2.5 5-4.9 5.3.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0 0 12 2z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
