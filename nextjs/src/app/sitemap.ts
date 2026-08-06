import type { MetadataRoute } from 'next';
import { languages, levels } from '../data/languages';

const BASE_URL = 'https://lingohub.uz';
const TODAY = new Date();

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: TODAY,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Language dashboard pages: /english, /spanish, ...
  for (const lang of languages) {
    routes.push({
      url: `${BASE_URL}/${lang.id}`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // Level pages: /english/beginner, /english/elementary, ...
  for (const lang of languages) {
    for (const level of levels) {
      routes.push({
        url: `${BASE_URL}/${lang.id}/${level.id}`,
        lastModified: TODAY,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return routes;
}
