import { useEffect } from "react";
import SEOHead from "@/components/SEO/SEOHead";

const About = () => {
  useEffect(() => {
    window.location.replace("/legacy-home/aboutus.html");
  }, []);

  return (
    <>
      <SEOHead
        title="About Us | Graven Automation"
        description="About Graven Automation"
        canonical="/about"
      />
      <div className="min-h-screen" />
    </>
  );
};

export default About;
