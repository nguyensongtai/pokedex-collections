// Route file: composition only. The fetching lives in the feature's `api.ts`;
// this server component awaits it, turns an unknown id into a 404, and hands
// plain data to the feature's view.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PokemonDetailView, fetchDexSize, fetchPokemonDetail } from '@/features/pokemon-detail';
import { formatDexNumber, formatPokemonName } from '@/shared/types/pokemon';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

/** `/pokemon/abc` and `/pokemon/-4` are 404s, not crashes. */
function parseDexId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 ? id : null;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const id = parseDexId((await params).id);
  if (id === null) return {};

  const detail = await fetchPokemonDetail(id);
  if (!detail) return {};

  const name = formatPokemonName(detail.name);
  return {
    title: `${name} ${formatDexNumber(detail.id)}`,
    description:
      detail.flavorText || `${name} — types, base stats and abilities from the Pokédex.`,
  };
}

export default async function PokemonDetailPage({ params }: DetailPageProps) {
  const id = parseDexId((await params).id);
  if (id === null) notFound();

  // Both requests are independent, so they overlap rather than queue.
  const [detail, dexSize] = await Promise.all([fetchPokemonDetail(id), fetchDexSize()]);
  if (!detail) notFound();

  return (
    <PokemonDetailView
      detail={detail}
      previousId={detail.id > 1 ? detail.id - 1 : null}
      nextId={detail.id < dexSize ? detail.id + 1 : null}
    />
  );
}
