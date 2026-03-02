import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ExternalLink } from "lucide-react";

const skills = {
  languages: [
    { name: "JavaScript", level: 90 },
    { name: "Python", level: 85 },
    { name: "SQL", level: 95 },
    { name: "SAS", level: 90 },
    { name: "CQL", level: 80 },
    { name: "VBA", level: 70 },
  ],
  technologies: [
    "React", "Node.js", "FHIR", "Tableau", "Git", "Docker",
    "Microsoft Office", "Measure Authoring Tools", "Bonnie",
  ],
};

const projects = [
  {
    title: "PDC Calculator",
    description: "Proportion of Days Covered calculator with RxNav API integration",
    href: "/pdc",
    tags: ["JavaScript", "Healthcare"],
  },
  {
    title: "MED Calculator",
    description: "Morphine Milligram Equivalents calculator for opioid safety",
    href: "/med",
    tags: ["JavaScript", "Clinical"],
  },
  {
    title: "Statin Converter",
    description: "Statin intensity conversion and dosing calculator",
    href: "/statins",
    tags: ["JavaScript", "Pharmacy"],
  },
  {
    title: "ICD-10 Explorer",
    description: "Searchable ICD-10 code database and explorer",
    href: "/icd10",
    tags: ["JavaScript", "Healthcare"],
  },
  {
    title: "Dashboard",
    description: "Performance measurement dashboard with star ratings",
    href: "/dashboard",
    tags: ["JavaScript", "Analytics"],
  },
  {
    title: "CQL Runner",
    description: "Clinical Quality Language code runner and tester",
    href: "/cql-camp",
    tags: ["CQL", "Healthcare"],
  },
];

export function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Technical Skills & Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I love learning about the latest technologies, particularly machine
            learning and natural language processing. Check out some of my projects.
          </p>
        </motion.div>

        {/* Skills */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Programming Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.languages.map((skill, index) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.level}%` } : {}}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Technologies & Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.technologies.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <h3 className="text-2xl font-bold mb-8 text-center">Featured Projects</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link to={project.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-muted rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
