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
  const containerClasses = `relative w-full overflow-hidden ${
    className ? className : "bg-black py-6"
  }`;

  return (
    <div className={containerClasses}>
      <div className="overflow-hidden whitespace-nowrap relative">
        <div
          className="animate-marquee flex items-center gap-10"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          {[...techs, ...techs].map((Icon, i) => (
            <div
              key={i}
              className="text-4xl md:text-5xl text-slate-500 hover:text-emerald-400 transition duration-300 drop-shadow-[0_5px_15px_rgba(16,185,129,0.15)]"
              aria-hidden
            >
              <Icon />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent" />
      </div>
    </div>
  );
}
