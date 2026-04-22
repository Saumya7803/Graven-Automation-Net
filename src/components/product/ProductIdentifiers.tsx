import { Badge } from "@/components/ui/badge";

type LifecycleStatus = 'active' | 'discontinued' | 'obsolete';

interface ProductIdentifiersProps {
  brand?: string | null;
  category?: string | null;
  series?: string | null;
  sku: string;
  isActive?: boolean;
  lifecycleStatus?: LifecycleStatus | null;
  condition?: string | null;
}

export const ProductIdentifiers = ({
  brand,
  category,
  series,
  sku,
  isActive = true,
  lifecycleStatus,
  condition
}: ProductIdentifiersProps) => {
  // Determine lifecycle from either new field or legacy is_active
  const effectiveStatus: LifecycleStatus = lifecycleStatus || (isActive ? 'active' : 'discontinued');

  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
            Active
          </Badge>
        );
      case 'discontinued':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5" />
            Discontinued
          </Badge>
        );
      case 'obsolete':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
            End-of-Life
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2">
        {brand && (
          <Badge variant="outline" className="font-medium">
            {brand}
          </Badge>
        )}
        {category && (
          <Badge variant="secondary">
            {category}
          </Badge>
        )}
        {series && (
          <Badge variant="outline" className="bg-muted/50">
            {series} Series
          </Badge>
        )}
        {condition && condition !== 'new' && (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
            {condition.charAt(0).toUpperCase() + condition.slice(1)}
          </Badge>
        )}
      </div>
      
      {/* Model & Status Row */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Model:</span>
          <span className="font-mono font-medium">{sku}</span>
        </div>
        {getStatusBadge()}
      </div>
    </div>
  );
};
