import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || 'Your Home';
  const score = searchParams.get('score') || 'D';
  const ratingLabel = searchParams.get('rating_label') || 'B';
  const energyCost = searchParams.get('energy_cost') || 'Save £549/year';
  const solarPotential = searchParams.get('solar_potential') || '3,150 kWh';
  const format = searchParams.get('format') || 'og';

  const isSquare = format === 'square';
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 630;

  const scoreColor = getRatingColor(score);
  const potentialColor = getRatingColor(ratingLabel);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #08080d 0%, #0a0a0f 100%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        {/* Branding */}
        <div
          style={{
            fontSize: isSquare ? '64px' : '48px',
            fontWeight: 'bold',
            color: '#4ecdc4',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Evolving Home
        </div>

        {/* Rating */}
        <div
          style={{
            fontSize: isSquare ? '160px' : '120px',
            fontWeight: 'bold',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ color: scoreColor }}>{score}</span>
          <span style={{ color: '#4ecdc4', margin: '0 20px' }}>→</span>
          <span style={{ color: potentialColor }}>{ratingLabel}</span>
        </div>

        {/* Address */}
        <div
          style={{
            fontSize: isSquare ? '32px' : '24px',
            marginBottom: '10px',
            textAlign: 'center',
          }}
        >
          {address}
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: isSquare ? '24px' : '18px',
            color: '#4ecdc4',
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          Room to improve 🔧
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
            maxWidth: '800px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontSize: isSquare ? '28px' : '20px',
              margin: '10px',
            }}
          >
            <div style={{ fontSize: isSquare ? '40px' : '30px', marginBottom: '5px' }}>💰</div>
            {energyCost}
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: isSquare ? '28px' : '20px',
              margin: '10px',
            }}
          >
            <div style={{ fontSize: isSquare ? '40px' : '30px', marginBottom: '5px' }}>☀️</div>
            {solarPotential} solar potential
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: isSquare ? '28px' : '20px',
            color: '#4ecdc4',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Check your home → evolvinghome.ai
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}

function getRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    A: '#00c781',
    B: '#19b459',
    C: '#8dce46',
    D: '#ffd500',
    E: '#fcaa65',
    F: '#ef8023',
    G: '#e9153b',
  };
  return colors[rating?.toUpperCase()] || '#8b949e';
}