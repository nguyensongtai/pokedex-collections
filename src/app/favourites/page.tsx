// Route file: composition only.
import type { Metadata } from 'next';
import { FavouritesBoard } from '@/features/favourites';

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'Your favourited Pokémon, organised into custom groups.',
};

export default function FavouritesPage() {
  return <FavouritesBoard />;
}
