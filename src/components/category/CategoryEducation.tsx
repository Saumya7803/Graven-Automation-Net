import { BookOpen } from "lucide-react";

interface CategoryEducationProps {
  categoryName: string;
  longDescription?: string | null;
  categorySlug: string;
}

// Fallback educational content by category type
const FALLBACK_CONTENT: Record<string, { title: string; content: string }> = {
  vfd: {
    title: "What is a VFD?",
    content: "A Variable Frequency Drive (VFD), also known as an inverter or AC drive, is an electronic device that controls the speed and torque of an electric motor by varying the frequency and voltage of its power supply. VFDs are essential in modern industrial applications for energy efficiency, precise motor control, and extending equipment lifespan. They're widely used in pumps, fans, conveyors, and manufacturing machinery where variable speed control is required."
  },
  plc: {
    title: "What is a PLC?",
    content: "A Programmable Logic Controller (PLC) is a ruggedized industrial computer designed for controlling manufacturing processes, assembly lines, and robotic devices. PLCs monitor inputs, make decisions based on programmed logic, and control outputs to automate production. They're essential for reliable, real-time automation in harsh industrial environments where standard computers cannot operate effectively."
  },
  hmi: {
    title: "What is an HMI?",
    content: "A Human Machine Interface (HMI) is a user interface that connects operators to machines, systems, or devices. In industrial settings, HMIs are touchscreen panels or displays that allow operators to monitor production data, adjust parameters, and control automated systems. Modern HMIs provide real-time visualization, data logging, and connectivity to plant networks."
  },
  servo: {
    title: "What is a Servo System?",
    content: "A Servo system combines a servo motor with a controller/amplifier to provide precise position, velocity, and torque control. Servo systems are critical in applications requiring high accuracy and dynamic response, such as CNC machines, robotics, packaging equipment, and assembly automation. They offer superior performance compared to standard motors for precision motion control."
  },
  default: {
    title: "About This Category",
    content: "This category contains industrial automation components from leading manufacturers. Our products are sourced directly from authorized distributors and verified for authenticity. Whether you need replacement parts, new installations, or upgrades, our technical team can help you select the right components for your application."
  }
};

export const CategoryEducation = ({ categoryName, longDescription, categorySlug }: CategoryEducationProps) => {
  // Determine which fallback content to use based on category slug
  const getFallbackKey = (slug: string): string => {
    const lowerSlug = slug.toLowerCase();
    if (lowerSlug.includes('vfd') || lowerSlug.includes('drive') || lowerSlug.includes('inverter')) return 'vfd';
    if (lowerSlug.includes('plc') || lowerSlug.includes('controller')) return 'plc';
    if (lowerSlug.includes('hmi') || lowerSlug.includes('panel') || lowerSlug.includes('display')) return 'hmi';
    if (lowerSlug.includes('servo')) return 'servo';
    return 'default';
  };

  const fallbackKey = getFallbackKey(categorySlug);
  const fallback = FALLBACK_CONTENT[fallbackKey] || FALLBACK_CONTENT.default;

  const title = longDescription ? `What is a ${categoryName}?` : fallback.title;
  const content = longDescription || fallback.content;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
