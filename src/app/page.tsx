// Route file: composition only. All browse behaviour lives in the feature,
// which is imported through its public API.
import { BrowseView } from '@/features/pokemon-browse';

export default function BrowsePage() {
  return <BrowseView />;
}
