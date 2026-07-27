import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  location?: string;
  geoRegion?: string;
  geoPosition?: string;
}

const CONSISTENT_TITLE = 'Trishna Properties — Premium Rentals in Bangalore';

const defaultProps: SEOProps = {
  title: CONSISTENT_TITLE,
  description: 'Find your dream home with Prishna Properties. Premium residential and commercial properties for rent and sale in Bangalore, India.',
  keywords: 'real estate, Bangalore properties, apartments for rent, houses for sale, residential properties, commercial real estate',
  image: 'https://prishnaproperties.com/og-image.jpg', // Replace with your actual image
  url: 'https://prishnaproperties.com', // Replace with your actual domain
  type: 'website',
  location: 'Bangalore, Karnataka, India',
  geoRegion: 'IN-KA',
  geoPosition: '12.9716;77.5946', // Bangalore coordinates
};

export const SEO: React.FC<SEOProps> = (props) => {
  const { description, keywords, image, url, type, location, geoRegion, geoPosition } = {
    ...defaultProps,
    ...props,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{CONSISTENT_TITLE}</title>
      <meta name="title" content={CONSISTENT_TITLE} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={CONSISTENT_TITLE} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Trishna Properties" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={CONSISTENT_TITLE} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Geo Tags (GEO Optimization) */}
      <meta name="geo.region" content={geoRegion} />
      <meta name="geo.placename" content={location} />
      <meta name="geo.position" content={geoPosition} />
      <meta name="ICBM" content={geoPosition} />

      {/* AEO (Answer Engine Optimization) */}
      <meta name="format-detection" content="telephone=no" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Trishna Properties" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Trishna Properties",
          "description": description,
          "url": url,
          "logo": image,
          "telephone": "+91 98861 04532",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bangalore",
            "addressRegion": "Karnataka",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "12.9716",
            "longitude": "77.5946"
          },
          "areaServed": [
            {
              "@type": "City",
              "name": "Bangalore"
            },
            {
              "@type": "City",
              "name": "Whitefield"
            },
            {
              "@type": "City",
              "name": "Electronic City"
            },
            {
              "@type": "City",
              "name": "Indiranagar"
            }
          ]
        })}
      </script>
    </Helmet>
  );
};

// Export a provider to wrap your app
export const SEOProvider = HelmetProvider;
