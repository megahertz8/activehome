import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const dataPoints = [
  {
    emoji: '🧱',
    title: 'Wall Insulation',
    description: 'Cavity, solid, or insulated — we identify your wall type and U-values',
  },
  {
    emoji: '🏗️',
    title: 'Roof & Loft',
    description: 'Insulation depth, loft type, and condition',
  },
  {
    emoji: '🪟',
    title: 'Windows & Glazing',
    description: 'Single, double, or triple glazing assessment',
  },
  {
    emoji: '🔥',
    title: 'Heating System',
    description: 'Boiler type, age, and efficiency rating',
  },
  {
    emoji: '🚿',
    title: 'Hot Water',
    description: 'Cylinder type, insulation, and heating method',
  },
  {
    emoji: '☀️',
    title: 'Solar Potential',
    description: 'Roof orientation, area, and annual generation estimate',
  },
  {
    emoji: '⚡',
    title: 'Live Energy Prices',
    description: 'Real-time tariffs from Octopus Energy API',
  },
  {
    emoji: '📐',
    title: 'Building Geometry',
    description: 'Floor area, height, and shape from satellite/OSM data',
  },
  {
    emoji: '🌡️',
    title: 'Heat Loss',
    description: 'Thermal bridging and air leakage estimates',
  },
  {
    emoji: '🌍',
    title: 'CO₂ Emissions',
    description: 'Current and potential carbon footprint',
  },
  {
    emoji: '💰',
    title: 'Available Grants',
    description: 'Government schemes you may be eligible for',
  },
  {
    emoji: '🏠',
    title: 'Property Profile',
    description: 'Age, type, construction method, and local authority',
  },
];

const dataSources = [
  {
    name: 'UK EPC Register',
    description: 'Official energy performance certificates',
    badge: 'Government Data',
  },
  {
    name: 'Octopus Energy',
    description: 'Live electricity and gas tariffs',
    badge: 'Real-Time',
  },
  {
    name: 'EU PVGIS',
    description: 'Solar irradiance and generation data',
    badge: 'EU Commission',
  },
  {
    name: 'OpenStreetMap',
    description: 'Building footprints and geometry',
    badge: 'Open Data',
  },
  {
    name: 'SAP/RdSAP',
    description: 'UK standard assessment methodology',
    badge: 'Industry Standard',
  },
  {
    name: 'TABULA/EPISCOPE',
    description: 'EU building typology database',
    badge: '20+ Countries',
  },
];

const appFeatures = [
  { name: 'Camera Scan', emoji: '📷' },
  { name: 'Satellite View', emoji: '🛰️' },
  { name: 'Digital Twin', emoji: '🏡' },
  { name: 'Energy Dashboard', emoji: '📊' },
  { name: 'Energy Leagues', emoji: '🏆' },
  { name: 'AI Recommendations', emoji: '🤖' },
  { name: 'Grant Alerts', emoji: '🔔' },
  { name: 'Multi-Country', emoji: '🌍' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-5xl font-bold text-foreground">
            Everything We Analyse
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We combine 12+ data sources to build the most complete picture of your home's energy performance
          </p>
        </div>
      </section>

      {/* Section 2: Data We Analyse */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Data We Analyse
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataPoints.map((item, index) => (
              <Card key={index} className="border-border hover:border-primary transition-all">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-4xl">{item.emoji}</div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Our Data Sources */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Our Data Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-foreground flex-1">
                      {source.name}
                    </h3>
                    <Badge variant="outline">{source.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {source.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: The App (Coming Soon) */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              The App
            </h2>
            <Badge variant="secondary" className="text-base px-4 py-1">
              Coming Soon
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {appFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-border opacity-60 relative overflow-hidden"
              >
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="text-3xl">{feature.emoji}</div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.name}
                  </h3>
                  <div className="absolute top-2 right-2 text-xl">🔒</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: How It All Connects */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How It All Connects
          </h2>
          <Card className="border-border">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl">🌐</div>
                  <div className="text-lg font-semibold text-foreground">Website</div>
                  <div className="text-sm text-muted-foreground">Analysis & Reports</div>
                </div>
                <div className="text-4xl text-primary">↔️</div>
                <div className="space-y-2">
                  <div className="text-4xl">📊</div>
                  <div className="text-lg font-semibold text-foreground">Data Sources</div>
                  <div className="text-sm text-muted-foreground">12+ APIs & Databases</div>
                </div>
                <div className="text-4xl text-primary">↔️</div>
                <div className="space-y-2">
                  <div className="text-4xl">📱</div>
                  <div className="text-lg font-semibold text-foreground">App</div>
                  <div className="text-sm text-muted-foreground">Coming Soon</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
