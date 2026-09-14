/**
 * Application copy, in every supported language.
 *
 * Trade-off: one shared dictionary rather than per-feature message files. For a
 * two-page app, splitting the copy across features would add ceremony (a
 * namespace per feature, a merge step) for no real benefit, and translators
 * would rather see one file. If the app grew, this is the piece to split first.
 *
 * `shared/i18n` holds the mechanism and the copy; it imports nothing from
 * `features/*`, so the one-way dependency direction is preserved.
 */

export const LANGUAGES = ['en', 'vi'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'EN',
  vi: 'VI',
};

export interface Dictionary {
  browse: string;
  favourites: string;
  language: string;
  home: string;

  searchPlaceholder: string;
  clear: string;
  loading: string;
  pokemon: string;
  of: string;

  errTitle: string;
  errHint: string;
  retry: string;

  noMatch: (query: string) => string;
  noMatchHint: string;
  showMore: (remaining: string) => string;

  nothingSaved: string;
  summary: (count: number, groups: number) => string;
  newGroupPlaceholder: string;
  createGroup: string;

  emptyTitle: string;
  emptyBody: string;
  browseCta: string;

  groupName: string;
  rename: string;
  deleteGroup: string;
  unsorted: string;
  allFavourites: string;
  groupEmpty: (group: string) => string;
  moveTo: string;
  remove: string;
  count: (n: number) => string;

  addFav: (name: string) => string;
  rmFav: (name: string) => string;
}

export const DICTIONARIES: Record<Language, Dictionary> = {
  en: {
    browse: 'Browse',
    favourites: 'Favourites',
    language: 'Language',
    home: 'PokéDex Collections, home',

    searchPlaceholder: 'Search by name, number or type…',
    clear: 'Clear search',
    loading: 'Loading the PokéDex…',
    pokemon: 'Pokémon',
    of: 'of',

    errTitle: 'Couldn’t reach the PokéDex',
    errHint: 'Check your connection and try again.',
    retry: 'Try again',

    noMatch: (query) => `No Pokémon match “${query}”`,
    noMatchHint: 'Try a name like Pikachu, a number like 25, or a type like fire.',
    showMore: (remaining) => `Show more · ${remaining} left`,

    nothingSaved: 'Nothing saved yet',
    summary: (count, groups) => `${count} Pokémon in ${groups} ${groups === 1 ? 'group' : 'groups'}`,
    newGroupPlaceholder: 'New group, e.g. Starters',
    createGroup: 'Create group',

    emptyTitle: 'Your collection starts here',
    emptyBody:
      'Tap the heart on any Pokémon to save it. Then sort your favourites into groups like Starters, Legendaries, or the team you’re raising right now.',
    browseCta: 'Browse Pokémon',

    groupName: 'Group name',
    rename: 'Rename',
    deleteGroup: 'Delete group',
    unsorted: 'Unsorted',
    allFavourites: 'All favourites',
    groupEmpty: (group) =>
      `Nothing here yet. Use “Move to” on any favourite to file it under ${group}.`,
    moveTo: 'Move to…',
    remove: 'Remove',
    count: (n) => `${n} Pokémon`,

    addFav: (name) => `Add ${name} to favourites`,
    rmFav: (name) => `Remove ${name} from favourites`,
  },

  vi: {
    browse: 'Khám phá',
    favourites: 'Yêu thích',
    language: 'Ngôn ngữ',
    home: 'PokéDex Collections, trang chủ',

    searchPlaceholder: 'Tìm theo tên, số hoặc hệ…',
    clear: 'Xoá tìm kiếm',
    loading: 'Đang tải PokéDex…',
    pokemon: 'Pokémon',
    of: 'trong',

    errTitle: 'Không kết nối được PokéDex',
    errHint: 'Kiểm tra kết nối mạng và thử lại.',
    retry: 'Thử lại',

    noMatch: (query) => `Không có Pokémon nào khớp “${query}”`,
    noMatchHint: 'Thử tên như Pikachu, số như 25, hoặc hệ như fire.',
    showMore: (remaining) => `Xem thêm · còn ${remaining}`,

    nothingSaved: 'Chưa lưu gì',
    summary: (count, groups) => `${count} Pokémon trong ${groups} nhóm`,
    newGroupPlaceholder: 'Nhóm mới, ví dụ: Starters',
    createGroup: 'Tạo nhóm',

    emptyTitle: 'Bộ sưu tập của bạn bắt đầu từ đây',
    emptyBody:
      'Nhấn vào trái tim trên bất kỳ Pokémon nào để lưu lại. Sau đó sắp xếp vào các nhóm như Starters, Legendaries, hay đội hình bạn đang nuôi.',
    browseCta: 'Khám phá Pokémon',

    groupName: 'Tên nhóm',
    rename: 'Đổi tên',
    deleteGroup: 'Xoá nhóm',
    unsorted: 'Chưa phân nhóm',
    allFavourites: 'Tất cả yêu thích',
    groupEmpty: (group) =>
      `Chưa có gì. Dùng “Chuyển đến” trên Pokémon yêu thích để đưa vào ${group}.`,
    moveTo: 'Chuyển đến…',
    remove: 'Bỏ',
    count: (n) => `${n} Pokémon`,

    addFav: (name) => `Thêm ${name} vào yêu thích`,
    rmFav: (name) => `Bỏ ${name} khỏi yêu thích`,
  },
};

export const DEFAULT_LANGUAGE: Language = 'en';
