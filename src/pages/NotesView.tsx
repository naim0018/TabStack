import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../components/Card';

interface NotesViewProps {
  notes: any[];
  searchQuery: string;
  now: number;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function NotesView({
  notes,
  searchQuery,
  now,
  onEdit,
  onDelete,
  onCreate,
}: NotesViewProps) {
  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black text-text-primary tracking-tight">
          My Notes
        </h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {filtered.map((note) => (
            <Card
              key={note.id}
              item={note}
              now={now}
              onClick={() => onEdit(note)}
              onEdit={() => onEdit(note)}
              onDelete={() => onDelete(note.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-border-card rounded-3xl opacity-30">
          You haven't created any notes yet.
        </div>
      )}
    </div>
  );
}
