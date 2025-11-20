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
} from "react-icons/si";

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
];

export default function TechStrip() {
  return (
    <div className="w-full bg-black py-6">
      <div className="overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee flex items-center gap-10">
          {[...techs, ...techs].map((Icon, i) => (
            <div
              key={i}
              className="text-4xl md:text-5xl text-neo-text-secondary hover:text-neo-primary transition duration-300"
            >
              <Icon />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent" />
      </div>
    </div>
  );
}
