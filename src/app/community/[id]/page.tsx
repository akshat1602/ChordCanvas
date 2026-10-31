import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Regenerate at most once per hour

async function getPublicProgression(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('progressions')
    .select(`*, chords (*)`)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function PublicProgressionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const progression = await getPublicProgression(id);

  if (!progression) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#121212] text-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-bold text-white">{progression.title}</h1>
          <p className="text-xs text-zinc-400 capitalize mt-1">
            Mode: {progression.instrument_mode} • Shared Progression
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-400">Chord Sequence:</h2>
          <div className="flex flex-wrap gap-3">
            {progression.chords
              ?.sort((a: any, b: any) => a.position - b.position)
              .map((chord: any, idx: number) => (
                <div 
                  key={idx} 
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-white font-bold"
                >
                  {chord.chord_name}
                </div>
              ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400">
            Build and analyze your own guitar chord progressions with AI at <a href="/" className="text-indigo-400 hover:underline">ChordCanvas</a>.
          </p>
        </div>
      </div>
    </main>
  );
}