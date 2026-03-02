import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui";

const stats = [
  { label: "Years in Healthcare", value: "15+" },
  { label: "Programming Languages", value: "8+" },
  { label: "Projects Completed", value: "20+" },
  { label: "Coffee Consumed", value: "∞" },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            About Me
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A pharmacist with a business degree who loves computers and is passionate
            about using data and technology to solve healthcare's problems.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Background</h3>
                <p className="text-muted-foreground mb-4">
                  I have worked in pharmacies, health plans, a PBM, a health system,
                  and now at a measure developer. Along the way, I've had broad exposure
                  to clinical guidelines, formulary, pharmacy operations and workflow,
                  clinical programs, pharmacy data, performance measurement, and
                  Medicare Part D.
                </p>
                <p className="text-muted-foreground">
                  What makes me stand out is that I am self-taught in several programming
                  languages and proficient in SQL, SAS, Python, and JavaScript.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Education</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    OSU
                  </div>
                  <div>
                    <h4 className="font-semibold">The Ohio State University</h4>
                    <p className="text-muted-foreground">Doctor of Pharmacy (PharmD)</p>
                    <p className="text-sm text-muted-foreground">2003 - 2007</p>
                    <p className="text-muted-foreground mt-2">Master of Business Administration (MBA)</p>
                    <p className="text-sm text-muted-foreground">2007 - 2009</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-12"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
