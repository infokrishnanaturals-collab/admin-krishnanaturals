import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://krishnanaturals.co.in';

    const supabase = await createServerSupabaseClient();

    // Fetch active products
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true);

    // Fetch published blogs
    const { data: blogs } = await supabase
        .from('blogs')
        .select('slug, published_at')
        .eq('is_published', true);

    // All Static Pages with SEO priority
    const routes: MetadataRoute.Sitemap = [
        { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
        { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
        { url: `${baseUrl}/legacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/leadership`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/wholesale`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/checkout`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/profile`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${baseUrl}/orders`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/security`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic Product Pages
    const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
        url: `${baseUrl}/shop/${product.slug}`,
        lastModified: new Date(product.updated_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Dynamic Blog Pages
    const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((blog) => ({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: new Date(blog.published_at),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [...routes, ...productRoutes, ...blogRoutes];
}
