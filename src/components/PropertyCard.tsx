import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Heart, Camera, Video } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '../data/properties';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  return (
    <Card className="group overflow-hidden border border-neutral-100 bg-white shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 cursor-pointer">
      <Link to={`/listings/${property.id}`} className="block">
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-50">
          {!imageLoaded && <div className="absolute inset-0 skeleton bg-neutral-100" />}
          <img
            src={property.images[0]}
            alt={`${property.title} — ${property.type === 'rent' ? 'For Rent' : 'For Sale'} in ${property.location}`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Subtle overlay shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />

          {/* Badges container */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge 
              variant="default"
              className={`px-3 py-1 font-semibold text-xs tracking-wider rounded-xl backdrop-blur-md shadow-sm border-none uppercase ${
                property.type === 'rent'
                  ? 'bg-brand-500/90 text-white'
                  : 'bg-gold-400 text-white'
              }`}
            >
              For {property.type === 'rent' ? 'Rent' : 'Sale'}
            </Badge>

            {property.furnished === 'fully' && (
              <Badge
                variant="secondary"
                className="px-2.5 py-1 font-medium text-xs rounded-xl bg-white/95 backdrop-blur-md text-navy-800 border-none shadow-sm"
              >
                Furnished
              </Badge>
            )}

            {property.videos && property.videos.length > 0 && (
              <Badge
                variant="secondary"
                className="px-2.5 py-1 font-semibold text-xs rounded-xl bg-navy-950/80 backdrop-blur-md text-white border border-white/20 shadow-sm flex items-center gap-1"
              >
                <Video className="h-3 w-3 text-brand-300" />
                <span>Video Tour</span>
              </Badge>
            )}
          </div>

          {/* Like button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white text-neutral-600 hover:text-red-500 transition-all duration-300 shadow-sm hover:scale-110 active:scale-95"
            aria-label="Add to favorites"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${
                isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-neutral-500'
              }`}
            />
          </button>

          {/* Image count */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-sm text-white text-xs font-semibold shadow-sm">
            <Camera className="h-3.5 w-3.5" />
            <span>{property.images.length}</span>
          </div>

          {/* Price overlay on mobile */}
          <div className="absolute bottom-4 left-4 md:hidden">
            <span className="text-lg font-bold text-white tracking-wide font-display">
              {formatPrice(property.price, property.type)}
              {property.type === 'rent' && <span className="text-xs font-normal opacity-95 ml-0.5">/mo</span>}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Price (Desktop) */}
          <div className="hidden md:block mb-2">
            <span className="text-2xl font-bold font-display text-navy-900 tracking-wide">
              {formatPrice(property.price, property.type)}
              {property.type === 'rent' && (
                <span className="text-xs font-normal text-neutral-500 tracking-wider uppercase ml-1">/ Month</span>
              )}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-navy-800 group-hover:text-brand-500 transition-colors duration-300 line-clamp-1 mb-1.5 tracking-wide">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-neutral-500 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1 text-brand-500 flex-shrink-0" />
            <span className="truncate tracking-wide">{property.location}</span>
          </div>

          {/* Specifications */}
          <div className="flex items-center justify-between text-neutral-600 text-xs pt-4 border-t border-neutral-100">
            <div className="flex items-center space-x-1 hover:text-brand-500 transition-colors">
              <Bed className="h-4 w-4 text-brand-500/80" />
              <span className="font-medium">{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-brand-500 transition-colors">
              <Bath className="h-4 w-4 text-brand-500/80" />
              <span className="font-medium">{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-brand-500 transition-colors">
              <Maximize className="h-4 w-4 text-brand-500/80" />
              <span className="font-medium">{property.area} Sq.Ft</span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
