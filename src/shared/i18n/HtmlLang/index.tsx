'use client';

import { useEffect } from 'react';
import { useLanguage } from '../store';

/**
 * Keeps `<html lang>` in step with the selected language.
 *
 * The attribute is not decoration: assistive technology picks the voice and
 * pronunciation rules from it, so Vietnamese copy under `lang="en"` is read with
 * English phonetics. It also drives hyphenation and spellchecking.
 *
 * `layout.tsx` renders the default language server-side and this corrects it
 * after hydration — a DOM side effect, which is what an effect is for. Renders
 * nothing.
 */
export function HtmlLang() {
  const language = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
