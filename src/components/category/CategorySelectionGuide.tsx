import { CheckCircle2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategorySelectionGuideProps {
  categoryName: string;
  categorySlug: string;
}

interface SelectionCriterion {
  title: string;
  description: string;
  tooltip?: string;
}

// Selection criteria by category type
const SELECTION_CRITERIA: Record<string, SelectionCriterion[]> = {
  vfd: [
    { 
      title: "Power Rating", 
      description: "Match the VFD power rating to your motor's requirements (typically same kW or slightly higher)",
      tooltip: "VFD should be rated at or above motor power for reliable operation"
    },
    { 
      title: "Input Voltage", 
      description: "Ensure compatibility with your available power supply (single-phase or three-phase)",
      tooltip: "Common options: 230V single-phase, 400V three-phase"
    },
    { 
      title: "Control Mode", 
      description: "Choose between V/F, sensorless vector, or closed-loop control based on precision needs",
      tooltip: "Vector control offers better torque at low speeds"
    },
    { 
      title: "Communication Protocols", 
      description: "Consider Modbus, CANopen, Profibus, or EtherCAT for system integration",
      tooltip: "Match protocols with your existing PLC/SCADA system"
    },
    { 
      title: "Environmental Rating", 
      description: "IP20 for panel mounting, IP55+ for harsh environments",
      tooltip: "Higher IP ratings protect against dust and water"
    },
    { 
      title: "Lifecycle Status", 
      description: "Prefer active products; discontinued models may have limited support",
      tooltip: "Check availability of spare parts and technical support"
    }
  ],
  plc: [
    { 
      title: "I/O Point Count", 
      description: "Calculate total digital and analog inputs/outputs needed, plus 20% expansion margin",
      tooltip: "Consider both current requirements and future expansion"
    },
    { 
      title: "Processing Speed", 
      description: "Faster scan times for high-speed applications like motion control",
      tooltip: "Measured in milliseconds per instruction"
    },
    { 
      title: "Communication Protocols", 
      description: "Ethernet/IP, Profinet, Modbus TCP/RTU support for connectivity",
      tooltip: "Consider compatibility with existing devices"
    },
    { 
      title: "Programming Environment", 
      description: "Ladder logic, function blocks, structured text capabilities",
      tooltip: "Match with team expertise and application complexity"
    },
    { 
      title: "Expansion Capability", 
      description: "Modular design allows adding I/O modules as needs grow",
      tooltip: "Check maximum module count and rack configurations"
    },
    { 
      title: "Safety Certification", 
      description: "SIL-rated PLCs for safety-critical applications",
      tooltip: "Required for machine safety and emergency stop functions"
    }
  ],
  hmi: [
    { 
      title: "Screen Size", 
      description: "7\" to 15\"+ based on operator distance and information density",
      tooltip: "Larger screens for complex SCADA applications"
    },
    { 
      title: "Resolution", 
      description: "Higher resolution for detailed graphics and small text",
      tooltip: "Consider viewing distance and detail requirements"
    },
    { 
      title: "Communication Ports", 
      description: "Ethernet, serial, USB connectivity for PLC integration",
      tooltip: "Check driver support for your PLC brand"
    },
    { 
      title: "Environmental Rating", 
      description: "IP65+ front face for washdown or dusty environments",
      tooltip: "Consider operating temperature range"
    },
    { 
      title: "Touch Technology", 
      description: "Resistive for gloved operation, capacitive for multi-touch",
      tooltip: "Resistive works better with industrial gloves"
    },
    { 
      title: "Memory & Processing", 
      description: "Sufficient for data logging, trending, and recipe management",
      tooltip: "Consider number of screens and data points"
    }
  ],
  servo: [
    { 
      title: "Torque Requirements", 
      description: "Calculate peak and continuous torque based on load and acceleration",
      tooltip: "Include safety factor for dynamic loads"
    },
    { 
      title: "Speed Range", 
      description: "Maximum RPM and speed control accuracy needed",
      tooltip: "Consider acceleration/deceleration profiles"
    },
    { 
      title: "Positioning Accuracy", 
      description: "Encoder resolution for required precision (pulses per revolution)",
      tooltip: "Higher resolution for precision applications"
    },
    { 
      title: "Feedback Type", 
      description: "Incremental or absolute encoders based on homing requirements",
      tooltip: "Absolute encoders maintain position after power loss"
    },
    { 
      title: "Motion Control", 
      description: "Point-to-point, interpolated motion, or electronic gearing",
      tooltip: "Match with motion controller capabilities"
    },
    { 
      title: "Safety Features", 
      description: "Safe torque off (STO), safe stop functions for machine safety",
      tooltip: "Required for CE marking and safety compliance"
    }
  ],
  default: [
    { 
      title: "Technical Specifications", 
      description: "Match product specs with your application requirements",
      tooltip: "Review datasheets carefully"
    },
    { 
      title: "Brand Compatibility", 
      description: "Consider integration with existing equipment and systems",
      tooltip: "Standardizing on brands simplifies maintenance"
    },
    { 
      title: "Lifecycle Status", 
      description: "Active products have better availability and support",
      tooltip: "Discontinued products may have limited spares"
    },
    { 
      title: "Environmental Conditions", 
      description: "Temperature, humidity, and IP rating for your environment",
      tooltip: "Harsh environments need higher protection ratings"
    },
    { 
      title: "Certification Requirements", 
      description: "CE, UL, or industry-specific certifications as needed",
      tooltip: "Required for regulatory compliance"
    },
    { 
      title: "Support & Documentation", 
      description: "Availability of manuals, technical support, and training",
      tooltip: "Important for installation and troubleshooting"
    }
  ]
};

export const CategorySelectionGuide = ({ categoryName, categorySlug }: CategorySelectionGuideProps) => {
  // Determine which criteria to use based on category slug
  const getCriteriaKey = (slug: string): string => {
    const lowerSlug = slug.toLowerCase();
    if (lowerSlug.includes('vfd') || lowerSlug.includes('drive') || lowerSlug.includes('inverter')) return 'vfd';
    if (lowerSlug.includes('plc') || lowerSlug.includes('controller')) return 'plc';
    if (lowerSlug.includes('hmi') || lowerSlug.includes('panel') || lowerSlug.includes('display')) return 'hmi';
    if (lowerSlug.includes('servo')) return 'servo';
    return 'default';
  };

  const criteriaKey = getCriteriaKey(categorySlug);
  const criteria = SELECTION_CRITERIA[criteriaKey] || SELECTION_CRITERIA.default;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              How Professionals Choose
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Key factors industrial engineers consider when selecting {categoryName}
            </p>
          </div>

          <TooltipProvider>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criteria.map((criterion, index) => (
                <div 
                  key={index}
                  className="p-5 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {criterion.title}
                        </h3>
                        {criterion.tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{criterion.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">
                    {criterion.description}
                  </p>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};
