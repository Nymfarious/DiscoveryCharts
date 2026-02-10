interface Person {
  id: string;
  name: string;
  birth?: string;
  death?: string;
  sex: 'M' | 'F' | 'U';
  fatherId?: string;
  motherId?: string;
  generation: number;
}

interface TreeVisualizationProps {
  gedData: Person[];
  maxGenerations: number;
}

export default function TreeVisualization({ gedData, maxGenerations }: TreeVisualizationProps) {
  if (gedData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Upload a GEDCOM file to see your family tree visualization
      </div>
    );
  }

  return (
    <div className="family-tree-container">
      <svg width="800" height="600" className="border border-border rounded-lg bg-card">
        {gedData.slice(0, 20).map((person, index) => {
          const x = 50 + (index % 8) * 90;
          const y = 50 + Math.floor(index / 8) * 100;
          
          return (
            <g key={person.id}>
              <circle
                cx={x} cy={y} r="25"
                fill={person.sex === 'M' ? '#3B82F6' : person.sex === 'F' ? '#EC4899' : '#6B7280'}
                stroke="#fff" strokeWidth="2"
              />
              <text x={x} y={y + 45} textAnchor="middle" fontSize="10" fill="currentColor" className="font-medium">
                {person.name.split(' ')[0] || 'Unknown'}
              </text>
              {person.birth && (
                <text x={x} y={y + 58} textAnchor="middle" fontSize="8" fill="currentColor" className="opacity-70">
                  {person.birth.match(/\d{4}/)?.[0] || ''}
                </text>
              )}
            </g>
          );
        })}
        
        <g transform="translate(650, 50)">
          <text x="0" y="0" fontSize="12" fontWeight="bold" fill="currentColor">Legend:</text>
          <circle cx="10" cy="20" r="8" fill="#3B82F6" />
          <text x="25" y="25" fontSize="10" fill="currentColor">Male</text>
          <circle cx="10" cy="40" r="8" fill="#EC4899" />
          <text x="25" y="45" fontSize="10" fill="currentColor">Female</text>
          <circle cx="10" cy="60" r="8" fill="#6B7280" />
          <text x="25" y="65" fontSize="10" fill="currentColor">Unknown</text>
        </g>
      </svg>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {Math.min(gedData.length, 20)} of {gedData.length} family members (up to {maxGenerations} generations)
      </div>
    </div>
  );
}

export type { Person };
