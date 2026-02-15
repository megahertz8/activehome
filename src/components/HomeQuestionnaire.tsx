import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Home } from '@/lib/types';

interface HomeQuestionnaireProps {
  homeId: string;
  countryCode?: string;
  onComplete: (data: Partial<Home>) => void;
  onSkip?: () => void;
}

const steps = 7;

const currencySymbols: Record<string, string> = {
  GB: '£',
  IL: '₪',
  // Add more
};

export default function HomeQuestionnaire(props: HomeQuestionnaireProps) {
  const { countryCode = 'GB', onComplete, onSkip } = props;
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<Home>>({});
  const [subStep, setSubStep] = useState(1); // For steps with multiple questions

  const next = () => {
    if (currentStep < steps) {
      setCurrentStep(currentStep + 1);
      setSubStep(1);
    } else {
      onComplete(data);
    }
  };

  const skip = () => {
    next();
  };

  const handleAnswer = (fields: Partial<Home>) => {
    setData((prev) => ({ ...prev, ...fields }));
    next();
  };

  const renderProgress = () => (
    <Badge variant="outline" className="mb-4">
      Step {currentStep} of {steps}
    </Badge>
  );

  const renderHeating = () => {
    const options = [
      { label: 'Gas boiler', desc: 'Gas boiler', fuel: 'mains gas' },
      { label: 'Heat pump', desc: 'Air source heat pump', fuel: 'electricity' },
      { label: 'Electric', desc: 'Electric storage heaters', fuel: 'electricity' },
      { label: 'Oil', desc: 'Oil boiler', fuel: 'heating oil' },
      { label: 'District heating', desc: 'District heating', fuel: 'community scheme' },
      { label: 'Other', desc: 'Other', fuel: 'To be used only when there is no heating/hot-water system' },
      { label: "Don't know", desc: null, fuel: null },
    ];

    return (
      <Card className="bg-background">
        <CardHeader>
          {renderProgress()}
          <CardTitle>What heats your home?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {options.map((opt) => (
            <Button
              key={opt.label}
              variant="outline"
              className="h-12 text-left justify-start"
              onClick={() => {
                if (opt.desc === null) {
                  skip();
                } else {
                  handleAnswer({ heating_description: opt.desc, main_fuel: opt.fuel });
                }
              }}
            >
              {opt.label}
            </Button>
          ))}
          <Button variant="link" onClick={skip}>Skip for now</Button>
        </CardContent>
      </Card>
    );
  };

  const renderWalls = () => {
    const [wallType, setWallType] = useState<string | null>(null);
    const [insulated, setInsulated] = useState<string | null>(null);

    if (subStep === 1) {
      const options = ['Solid brick', 'Cavity wall', 'Timber frame', 'Stone', 'Concrete', "Don't know"];
      return (
        <Card>
          {renderProgress()}
          <CardTitle>What are your walls made of?</CardTitle>
          <CardContent className="grid gap-2">
            {options.map((opt) => (
              <Button key={opt} variant="outline" onClick={() => {
                if (opt === "Don't know") {
                  skip();
                } else {
                  setWallType(opt);
                  setSubStep(2);
                }
              }}>
                {opt}
              </Button>
            ))}
            <Button variant="link" onClick={skip}>Skip for now</Button>
          </CardContent>
        </Card>
      );
    } else {
      const options = ['Yes', 'No', "Don't know"];
      return (
        <Card>
          {renderProgress()}
          <CardTitle>Are they insulated?</CardTitle>
          <CardContent className="grid gap-2">
            {options.map((opt) => (
              <Button key={opt} variant="outline" onClick={() => {
                if (opt === "Don't know") {
                  skip();
                } else {
                  setInsulated(opt);
                  const desc = opt === 'Yes' ? `${wallType}, filled cavity` : `${wallType}, no insulation`;
                  handleAnswer({ walls_description: desc });
                }
              }}>
                {opt}
              </Button>
            ))}
            <Button variant="link" onClick={skip}>Skip for now</Button>
          </CardContent>
        </Card>
      );
    }
  };

  // Similar for roof

  const renderRoof = () => {
    const [roofType, setRoofType] = useState<string | null>(null);
    const [insulation, setInsulation] = useState<string | null>(null);

    if (subStep === 1) {
      const options = ['Pitched (tiles/slate)', 'Flat', "Don't know"];
      return (
        <Card>
          {renderProgress()}
          <CardTitle>What\'s your roof like?</CardTitle>
          <CardContent>
            {options.map((opt) => (
              <Button key={opt} variant="outline" onClick={() => {
                if (opt === "Don't know") skip();
                else {
                  setRoofType(opt);
                  setSubStep(2);
                }
              }}>
                {opt}
              </Button>
            ))}
            <Button variant="link" onClick={skip}>Skip for now</Button>
          </CardContent>
        </Card>
      );
    } else {
      const options = ['Yes, thick', 'Yes, thin', 'No', 'No loft', "Don't know"];
      return (
        <Card>
          {renderProgress()}
          <CardTitle>Is your loft insulated?</CardTitle>
          <CardContent>
            {options.map((opt) => (
              <Button key={opt} variant="outline" onClick={() => {
                if (opt === "Don't know") skip();
                else {
                  setInsulation(opt);
                  let desc = '';
                  if (roofType === 'Flat') desc = 'Flat, limited insulation';
                  else if (opt === 'No loft') desc = 'Pitched, no insulation (assumed)';
                  else desc = `Pitched, ${opt === 'Yes, thick' ? '300 mm' : '100 mm'} loft insulation`;
                  handleAnswer({ roof_description: opt === 'No' ? 'Pitched, no insulation' : desc });
                }
              }}>
                {opt}
              </Button>
            ))}
            <Button variant="link" onClick={skip}>Skip for now</Button>
          </CardContent>
        </Card>
      );
    }
  };

  const renderWindows = () => {
    const options = ['Single glazed', 'Double glazed', 'Triple glazed', 'Mixed', "Don't know"];
    return (
      <Card>
        {renderProgress()}
        <CardTitle>What type of windows?</CardTitle>
        <CardContent>
          {options.map((opt) => (
            <Button key={opt} variant="outline" onClick={() => {
              if (opt === "Don't know") skip();
              else handleAnswer({ windows_description: opt === 'Double glazed' ? 'Fully double glazed' : opt });
            }}>
              {opt}
            </Button>
          ))}
          <Button variant="link" onClick={skip}>Skip for now</Button>
        </CardContent>
      </Card>
    );
  };

  const renderSize = () => {
    const [area, setArea] = useState(90);
    return (
      <Card>
        {renderProgress()}
        <CardTitle>Approximate floor area?</CardTitle>
        <CardContent>
          <Slider defaultValue={[90]} min={30} max={300} step={1} onValueChange={(v) => setArea(v[0])} className="my-6" />
          <p className="text-center">{area} m²</p>
          <p className="text-sm text-muted-foreground">Studio ~30m², 2-bed flat ~60m², 3-bed semi ~90m², 4-bed detached ~150m²</p>
          <Button onClick={() => handleAnswer({ total_floor_area: area })}>Next</Button>
          <Button variant="link" onClick={skip}>Skip for now</Button>
        </CardContent>
      </Card>
    );
  };

  const renderEnergyBills = () => {
    const [monthly, setMonthly] = useState('');
    const symbol = currencySymbols[countryCode] || '£';
    return (
      <Card>
        {renderProgress()}
        <CardTitle>Monthly energy spend?</CardTitle>
        <CardContent>
          <Input type="number" placeholder="Enter amount" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="my-4" />
          <p className="text-sm text-muted-foreground">In {symbol}</p>
          <Button onClick={() => {
            const annual = parseFloat(monthly) * 12;
            handleAnswer({ heating_cost: isNaN(annual) ? null : annual });
          }}>Next</Button>
          <Button variant="link" onClick={skip}>Skip for now</Button>
        </CardContent>
      </Card>
    );
  };

  const renderYearBuilt = () => {
    const options = ['Pre-1900', '1900-1950', '1950-1980', '1980-2000', '2000+', "Don't know"];
    const mappings: Record<string, number> = {
      'Pre-1900': 1850,
      '1900-1950': 1925,
      '1950-1980': 1965,
      '1980-2000': 1990,
      '2000+': 2010,
    };
    return (
      <Card>
        {renderProgress()}
        <CardTitle>When was your home built?</CardTitle>
        <CardContent>
          {options.map((opt) => (
            <Button key={opt} variant="outline" onClick={() => {
              if (opt === "Don't know") skip();
              else handleAnswer({ year_built: mappings[opt] || null });
            }}>
              {opt}
            </Button>
          ))}
          <Button variant="link" onClick={skip}>Skip for now</Button>
        </CardContent>
      </Card>
    );
  };

  const renders = [
    null,
    renderHeating,
    renderWalls,
    renderRoof,
    renderWindows,
    renderSize,
    renderEnergyBills,
    renderYearBuilt,
  ];

  return <div className="transition-opacity duration-300">{renders[currentStep]()}</div>;
}
