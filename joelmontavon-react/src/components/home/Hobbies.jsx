import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui";
import { ChefHat, Bike, Beer, Coffee, Book, Dumbbell } from "lucide-react";

const hobbies = [
  {
    name: "Cooking",
    icon: ChefHat,
    description: "Exploring new recipes and techniques",
    links: [
      { name: "Joshua Weissman", url: "https://www.youtube.com/c/JoshuaWeissman" },
      { name: "Dessert Person", url: "https://www.youtube.com/c/ClaireSaffitzxDessertPerson" },
    ],
  },
  {
    name: "Baking",
    icon: ChefHat,
    description: "Bread, pastries, and everything in between",
    links: [
      { name: "It's Alive with Brad", url: "https://www.youtube.com/playlist?list=PLKtIunYVkv_SUyXj_6Fe53okfzM9yVq1F" },
    ],
  },
  {
    name: "Biking",
    icon: Bike,
    description: "Road cycling and trail riding",
    links: [],
  },
  {
    name: "Brewing Beer",
    icon: Beer,
    description: "Home brewing experiments",
    links: [],
  },
  {
    name: "Fitness",
    icon: Dumbbell,
    description: "Staying active and healthy",
    links: [
      { name: "Caroline Girvan", url: "https://www.youtube.com/c/CarolineGirvan" },
      { name: "Heather Robertson", url: "https://www.youtube.com/c/Heatherrobertsoncom" },
    ],
  },
  {
    name: "Reading",
    icon: Book,
    description: "Michael Connelly fan (Harry Bosch series)",
    links: [
      { name: "Harry Bosch Series", url: "https://www.michaelconnelly.com/series/#Bosch" },
    ],
  },
];

export function Hobbies() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="hobbies" className="py-24">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Hobbies & Interests
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            On top of being a computer nerd, I love to cook and bake, bike,
            walk my dog, and brew (and drink) my own beer.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <hobby.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{hobby.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {hobby.description}
                  </p>
                  {hobby.links.length > 0 && (
                    <div className="space-y-1">
                      {hobby.links.map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary hover:underline"
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
