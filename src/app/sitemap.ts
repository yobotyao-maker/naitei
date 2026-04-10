import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://naitei-ai.vercel.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://naitei-ai.vercel.app/interview', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://naitei-ai.vercel.app/auth', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
