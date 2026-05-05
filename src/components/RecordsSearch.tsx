import { memo } from "react";

import { Search } from "lucide-react";

import { useRecords } from "@/hooks/useRecords";

import { RecordFilters } from "@/components/records/RecordFilters";

import { RecordTable } from "@/components/records/RecordTable";

import { RecordDetailModal } from "@/components/records/RecordDetailModal";

function RecordsSearchComponent() {

  const {
    records,
    filters,
    updateFilter,
    selectedRecord,
    setSelectedRecord,
    handleExportAll,
    handleExportSingle,
    getClipUrl,
    totalCount,
  } = useRecords();

  return (

    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-border bg-secondary/40">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Search className="w-4 h-4 text-primary" />

            <h2 className="font-semibold text-foreground">
              Búsqueda de Registros
            </h2>

          </div>

          <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded-md">
            {records.length} de {totalCount}
          </span>

        </div>

      </div>

      {/* FILTERS */}
      <RecordFilters
        filters={filters}
        onFilterChange={updateFilter}
        onExport={handleExportAll}
        resultCount={records.length}
      />

      {/* TABLE */}
      <RecordTable
        records={records}
        onRecordClick={setSelectedRecord}
        onExportSingle={handleExportSingle}
      />

      {/* MODAL */}
      <RecordDetailModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onExport={handleExportSingle}
        clipUrl={
          selectedRecord
            ? getClipUrl(selectedRecord.id)
            : null
        }
      />

    </div>
  );
}

export const RecordsSearch =
  memo(RecordsSearchComponent);
