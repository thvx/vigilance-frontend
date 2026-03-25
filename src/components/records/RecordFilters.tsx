import { CRIME_TYPE_LABELS } from '@/types/surveillance';
import { Search, Filter, Download, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DateRangeFilter } from './DateRangeFilter';
import type { RecordFilters as RecordFiltersType, DateFilter } from '@/hooks/useRecords';

interface RecordFiltersProps {
  filters: RecordFiltersType;
  onFilterChange: <K extends keyof RecordFiltersType>(key: K, value: RecordFiltersType[K]) => void;
  onExport: () => void;
  resultCount: number;
}

export function RecordFilters({ filters, onFilterChange, onExport, resultCount }: RecordFiltersProps) {
  const toggleCrimeType = (type: string) => {
    const newTypes = filters.crimeTypes.includes(type)
      ? filters.crimeTypes.filter(t => t !== type)
      : [...filters.crimeTypes, type];
    onFilterChange('crimeTypes', newTypes);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFilterChange('statuses', newStatuses);
  };

  const clearAllFilters = () => {
    onFilterChange('search', '');
    onFilterChange('crimeTypes', []);
    onFilterChange('statuses', []);
    onFilterChange('date', { mode: 'range', from: null, to: null });
  };

  return (
    <div className="p-3 sm:p-4 border-b border-border bg-secondary/30 space-y-3">
      {/* Row 1: Search + result count */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cámara, ubicación o ID..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-mono sm:hidden">
          {resultCount} resultados
        </span>
      </div>

      {/* Row 2: Filter dropdowns + date + export */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-start sm:items-center">
        {/* Crime Types Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-border gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Tipos de Delito
              {filters.crimeTypes.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {filters.crimeTypes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="max-h-64 overflow-y-auto px-2 py-2">
              {Object.entries(CRIME_TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 py-1.5 px-2 hover:bg-secondary/50 rounded cursor-pointer"
                  onClick={() => toggleCrimeType(key)}>
                  <input
                    type="checkbox"
                    checked={filters.crimeTypes.includes(key)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded"
                  />
                  <label className="flex-1 cursor-pointer text-sm">{label}</label>
                </div>
              ))}
            </div>
            {filters.crimeTypes.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onFilterChange('crimeTypes', [])}
                  className="text-xs text-muted-foreground"
                >
                  Limpiar selección
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-border gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Estados
              {filters.statuses.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {filters.statuses.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-2 space-y-1">
              {[
                { value: 'true_positive', label: 'Positivo Verdadero' },
                { value: 'false_positive', label: 'Falso Positivo' },
                { value: 'pending', label: 'Pendiente' },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-secondary/50 rounded cursor-pointer"
                  onClick={() => toggleStatus(value)}>
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(value)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded"
                  />
                  <label className="flex-1 cursor-pointer text-sm">{label}</label>
                </div>
              ))}
            </div>
            {filters.statuses.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onFilterChange('statuses', [])}
                  className="text-xs text-muted-foreground"
                >
                  Limpiar selección
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter */}
        <DateRangeFilter
          dateFilter={filters.date}
          onChange={(d) => onFilterChange('date', d)}
        />

        {/* Export Button */}
        <Button variant="outline" className="border-border w-full sm:w-auto" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Todo
        </Button>

        {/* Clear All Filters */}
        {(filters.search || filters.crimeTypes.length > 0 || filters.statuses.length > 0 || filters.date.from || filters.date.to) && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Applied Filters Display */}
      {(filters.crimeTypes.length > 0 || filters.statuses.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {filters.crimeTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1 px-2">
              {CRIME_TYPE_LABELS[type as keyof typeof CRIME_TYPE_LABELS]}
              <button
                onClick={() => toggleCrimeType(type)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.statuses.map(status => {
            const statusLabel = status === 'true_positive' ? 'Positivo Verdadero' :
              status === 'false_positive' ? 'Falso Positivo' : 'Pendiente';
            return (
              <Badge key={status} variant="secondary" className="gap-1 px-2">
                {statusLabel}
                <button
                  onClick={() => toggleStatus(status)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
