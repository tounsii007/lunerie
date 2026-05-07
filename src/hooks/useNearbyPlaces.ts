import { useQuery } from '@tanstack/react-query';
import { externalContentService } from '@/api/services/externalContentService';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useNearbyPlaces(coords: Coordinates | null) {
  return useQuery({
    queryKey: ['places', 'nearby-runtime', coords?.latitude ?? 'none', coords?.longitude ?? 'none'],
    enabled: Boolean(coords),
    queryFn: () => externalContentService.getNearbyPlaces(coords as Coordinates),
  });
}
