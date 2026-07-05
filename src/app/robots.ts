import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/checkout/', '/manager/'],
        },
        sitemap: 'https://krishnanaturals.in/sitemap.xml',
    };
}
