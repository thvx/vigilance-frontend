import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateFilter } from '@/hooks/useRecords';

interface DateRangeFilterProps {
  dateFilter: DateFilter;
  onChange: (filter: DateFilter) => void;
}

export function DateRangeFilter({ dateFilter, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const hasFilter = dateFilter.from || dateFilter.to;
  const label = hasFilter
    ? dateFilter.from && dateFilter.to
      ? `${format(dateFilter.from, 'dd/MM/yy', { locale: es })} - ${format(dateFilter.to, 'dd/MM/yy', { locale: es })}`
      : dateFilter.from
        ? `Desde ${format(dateFilter.from, 'dd/MM/yy', { locale: es })}`
        : `Hasta ${format(dateFilter.to!, 'dd/MM/yy', { locale: es })}`
    : undefined;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    onChange({
      mode: 'range',
      from: range?.from || null,
      to: range?.to || null,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ mode: 'range', from: null, to: null });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full sm:w-auto border-border justify-start text-left font-normal',
            hasFilter && 'text-primary border-primary/50'
          )}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {label || 'Fecha'}
          {hasFilter && (
            <X className="w-3 h-3 ml-2 hover:text-destructive" onClick={handleClear} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">Seleccionar rango de fechas</p>
          <p className="text-xs text-muted-foreground">Click para inicio, click para fin</p>
        </div>
        <CalendarUI
          mode="range"
          selected={
            dateFilter.from
              ? { from: dateFilter.from, to: dateFilter.to || undefined }
              : undefined
          }
          onSelect={handleSelect}
          locale={es}
          numberOfMonths={1}
        />
        {hasFilter && (
          <div className="p-3 border-t border-border flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange({ mode: 'range', from: null, to: null });
                setOpen(false);
              }}
            >
              Limpiar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
