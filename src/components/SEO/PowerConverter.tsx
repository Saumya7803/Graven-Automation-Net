import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

export const PowerConverter = () => {
  const [hp, setHp] = useState("");
  const [kw, setKw] = useState("");

  const convertHpToKw = (hpValue: number) => {
    return (hpValue * 0.746).toFixed(2);
  };

  const convertKwToHp = (kwValue: number) => {
    return (kwValue / 0.746).toFixed(2);
  };

  const handleHpChange = (value: string) => {
    setHp(value);
    if (value && !isNaN(Number(value))) {
      setKw(convertHpToKw(Number(value)));
    } else {
      setKw("");
    }
  };

  const handleKwChange = (value: string) => {
    setKw(value);
    if (value && !isNaN(Number(value))) {
      setHp(convertKwToHp(Number(value)));
    } else {
      setHp("");
    }
  };

  const handleSwap = () => {
    const tempHp = hp;
    setHp(kw ? convertKwToHp(Number(kw)) : "");
    setKw(tempHp ? convertHpToKw(Number(tempHp)) : "");
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <h3 className="text-xl font-bold mb-4">HP to kW Power Converter</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Convert between Horsepower (HP) and Kilowatts (kW) for VFD sizing
      </p>
      
      <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div>
          <Label htmlFor="hp-input" className="mb-2">Horsepower (HP)</Label>
          <Input
            id="hp-input"
            type="number"
            placeholder="Enter HP"
            value={hp}
            onChange={(e) => handleHpChange(e.target.value)}
            className="h-12 text-lg"
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwap}
          className="h-12 w-12"
          title="Swap values"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
        
        <div>
          <Label htmlFor="kw-input" className="mb-2">Kilowatts (kW)</Label>
          <Input
            id="kw-input"
            type="number"
            placeholder="Enter kW"
            value={kw}
            onChange={(e) => handleKwChange(e.target.value)}
            className="h-12 text-lg"
          />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Formula:</span> 1 HP ≈ 0.746 kW | 1 kW ≈ 1.34 HP
        </p>
      </div>
    </Card>
  );
};