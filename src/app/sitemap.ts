import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://naitei.ai', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://naitei.ai/interview', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://naitei.ai/auth', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
