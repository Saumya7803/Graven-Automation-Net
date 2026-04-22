import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Wind,
  Droplets,
  Pizza,
  Pickaxe,
  Fuel,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const industries = [
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "hvac", label: "HVAC", icon: Wind },
  { id: "water", label: "Water Treatment", icon: Droplets },
  { id: "food", label: "Food & Beverage", icon: Pizza },
  { id: "mining", label: "Mining", icon: Pickaxe },
  { id: "oil-gas", label: "Oil & Gas", icon: Fuel },
];

const powerRanges = [
  { id: "low", label: "Low Power (0.18 - 2.2 kW)", range: "0.18-2.2" },
  { id: "medium", label: "Medium Power (3 - 15 kW)", range: "3-15" },
  { id: "high", label: "High Power (18.5 - 75 kW)", range: "18.5-75" },
  { id: "industrial", label: "Industrial (90 - 500 kW)", range: "90-500" },
];

const features = [
  { id: "energy", label: "Energy Efficiency" },
  { id: "safety", label: "Built-in Safety Functions" },
  { id: "communication", label: "Communication Protocols" },
  { id: "vector", label: "Vector Control" },
  { id: "ip-rating", label: "High IP Rating (IP54+)" },
  { id: "braking", label: "Braking Resistor" },
];

const ProductFinder = () => {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedPowerRange, setSelectedPowerRange] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const navigate = useNavigate();

  const progress = (step / 3) * 100;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleFindProducts = () => {
    const params = new URLSearchParams();
    if (selectedPowerRange) {
      const range = powerRanges.find((r) => r.id === selectedPowerRange);
      if (range) params.set("power", range.range);
    }
    navigate(`/shop?${params.toString()}`);
  };

  const canProceed = () => {
    if (step === 1) return selectedIndustry !== "";
    if (step === 2) return selectedPowerRange !== "";
    return true;
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect VFD</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions and we'll help you find the ideal Variable Frequency Drive for your needs
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Step {step} of 3
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "What's Your Industry or Application?"}
                {step === 2 && "What Power Range Do You Need?"}
                {step === 3 && "Select Desired Features"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <RadioGroup value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {industries.map((industry) => {
                      const Icon = industry.icon;
                      return (
                        <div key={industry.id}>
                          <Label
                            htmlFor={industry.id}
                            className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          >
                            <RadioGroupItem value={industry.id} id={industry.id} />
                            <Icon className="w-6 h-6 text-primary" />
                            <span className="font-medium">{industry.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              )}

              {step === 2 && (
                <RadioGroup value={selectedPowerRange} onValueChange={setSelectedPowerRange}>
                  <div className="space-y-4">
                    {powerRanges.map((range) => (
                      <div key={range.id}>
                        <Label
                          htmlFor={range.id}
                          className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        >
                          <RadioGroupItem value={range.id} id={range.id} />
                          <span className="font-medium">{range.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">
                    Select all features that are important for your application (optional)
                  </p>
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Checkbox
                        id={feature.id}
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                      />
                      <Label htmlFor={feature.id} className="font-medium cursor-pointer flex-1">
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={step === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {step < 3 ? (
                  <Button onClick={handleNext} disabled={!canProceed()}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleFindProducts} disabled={!canProceed()}>
                    Find Products
                    <Search className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductFinder;
