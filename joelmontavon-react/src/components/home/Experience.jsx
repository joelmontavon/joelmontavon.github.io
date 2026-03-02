import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui";

const experience = [
  {
    title: "Research Health Informaticist",
    company: "RTI International",
    period: "Jul 2024 - Present",
    logo: "RTI",
  },
  {
    title: "Director, Analytics and Performance Measurement",
    company: "Pharmacy Quality Alliance",
    period: "Jul 2018 - Jul 2024",
    logo: "PQA",
  },
  {
    title: "Pharmacy Information Technology Analyst",
    company: "Advocate Health Care",
    period: "Jan 2018 - Jul 2018",
    logo: "AHC",
  },
  {
    title: "Manager, Clinical Pharmacy",
    company: "Aetna",
    period: "Mar 2015 - Dec 2017",
    logo: "AET",
  },
  {
    title: "Medicare Quality Measures Manager",
    company: "Catamaran (now OptumRx)",
    period: "Apr 2011 - Mar 2015",
    logo: "OPT",
  },
  {
    title: "Manager, Medicare Pharmacy",
    company: "EmblemHealth",
    period: "Oct 2009 - Apr 2011",
    logo: "EH",
  },
];

const education = [
  {
    degree: "Master of Business Administration (MBA)",
    school: "The Ohio State University",
    period: "2007 - 2009",
    logo: "OSU",
  },
  {
    degree: "Doctor of Pharmacy (PharmD)",
    school: "The Ohio State University",
    period: "2003 - 2007",
    logo: "OSU",
  },
];

const certifications = [
  {
    name: "PyTorch Essential Training: Deep Learning",
    issuer: "LinkedIn",
    date: "Aug 2023",
  },
  {
    name: "React.js Essential Training",
    issuer: "LinkedIn",
    date: "Mar 2023",
  },
  {
    name: "Machine Learning",
    issuer: "Stanford University (Coursera)",
    date: "Completed",
  },
  {
    name: "Six Sigma Green Belt",
    issuer: "MoreSteam.com LLC",
    date: "Completed",
  },
];

const awards = [
  {
    title: "Super Star Award",
    organization: "Aetna",
    date: "Dec 2015",
  },
  {
    title: "Excellence Award",
    organization: "Catamaran",
    date: "Jul 2014",
  },
  {
    title: "Excellence Award",
    organization: "Catamaran",
    date: "Apr 2012",
  },
];

export function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-24">
      <div className="container">
        {/* Work Experience Section */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Work Experience
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A journey through various healthcare organizations, from pharmacies to
            health plans to measure development.
          </p>
        </motion.div>

        <div className="relative mb-24">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-8">
            {experience.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="md:ml-12">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Logo placeholder */}
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {job.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-primary">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.period}</p>
                      </div>
                      {/* Timeline dot */}
                      <div className="absolute left-6 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Education
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building a strong foundation in pharmacy and business administration.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 mb-24">
          {education.map((edu, index) => (
            <motion.div
              key={edu.degree}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + 0.1 * index }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {edu.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-primary">{edu.school}</p>
                      <p className="text-sm text-muted-foreground">{edu.period}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Certifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Certifications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Continuous learning in technology, data science, and process improvement.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-24">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + 0.1 * index }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{cert.name}</h3>
                  <p className="text-primary text-xs">{cert.issuer}</p>
                  <p className="text-xs text-muted-foreground">{cert.date}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Awards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Awards & Recognition
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recognition for excellence and outstanding contributions.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          {awards.map((award, index) => (
            <motion.div
              key={`${award.title}-${award.date}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + 0.1 * index }}
            >
              <Card className="h-full">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm">{award.title}</h3>
                  <p className="text-primary text-xs">{award.organization}</p>
                  <p className="text-xs text-muted-foreground">{award.date}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
