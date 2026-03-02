import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Heart } from "lucide-react";

const footerLinks = {
  calculators: [
    { name: "PDC Calculator", href: "/pdc" },
    { name: "MED Calculator", href: "/med" },
    { name: "Statin Converter", href: "/statins" },
    { name: "ICD-10 Explorer", href: "/icd10" },
  ],
  resources: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Measures", href: "/measures" },
    { name: "Trends", href: "/trends" },
    { name: "Star Ratings", href: "/star-ratings-trends" },
  ],
  tutorials: [
    { name: "Risk Adjustment", href: "/risk-adj" },
    { name: "PDC with Python", href: "/pdc-python" },
    { name: "PDC with SQL", href: "/pdc-sql" },
    { name: "PDC with SAS", href: "/pdc-sas" },
  ],
};

const socialLinks = [
  { name: "Email", href: "mailto:thetechiepharmacist@gmail.com", icon: Mail },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/joel-montavon", icon: Linkedin },
  { name: "GitHub", href: "https://github.com/joelmontavon", icon: Github },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-bold">
              Joel Montavon
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Clinical Data Standards Lead specializing in healthcare data
              interoperability and performance measurement.
            </p>
            <div className="mt-4 flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Calculators */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Calculators</h3>
            <ul className="space-y-2">
              {footerLinks.calculators.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tutorials */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Tutorials</h3>
            <ul className="space-y-2">
              {footerLinks.tutorials.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500" /> using React & Tailwind CSS
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Joel Montavon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
