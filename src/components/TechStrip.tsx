import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiHtml5,
  SiCss3,
  SiVuedotjs,
  SiAngular,
  SiFigma,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGit,
  SiGithub,
  SiVercel,
  SiFirebase,
  SiJenkins,
  SiAwsamplify,
  SiGraphql,
  SiMysql,
  SiPrisma,
  SiRedis,
  SiKubernetes,
  SiPython,
  SiGo,
} from "react-icons/si";

type TechStripProps = {
  speedSeconds?: number;
  className?: string;
};

const techs = [
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiHtml5,
  SiCss3,
  SiVuedotjs,
  SiAngular,
  SiFigma,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGit,
  SiGithub,
  SiVercel,
  SiFirebase,
  SiJenkins,
  SiAwsamplify,
  SiGraphql,
  SiMysql,
  SiPrisma,
  SiRedis,
  SiKubernetes,
  SiPython,
  SiGo,
];

export default function TechStrip({ speedSeconds = 60, className }: TechStripProps) {
  const containerClasses = `relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden ${className ? className : "bg-black py-6"
    }`;

  return (
    <div className={containerClasses}>
      <div className="overflow-hidden whitespace-nowrap">
        <div
          className="animate-marquee flex min-w-max items-center gap-6 sm:gap-8 md:gap-10 will-change-transform"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          {[...techs, ...techs].map((Icon, i) => (
            <div
              key={i}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-300 drop-shadow-sm dark:drop-shadow-[0_5px_15px_rgba(16,185,129,0.15)]"
              aria-hidden
            >
              <Icon />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-white dark:from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 md:w-20 bg-gradient-to-l from-white dark:from-slate-950 to-transparent" />
      </div>
    </div>
  );
}
