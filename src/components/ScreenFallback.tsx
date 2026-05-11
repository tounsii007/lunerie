import { PlaceCardSkeleton, ScreenHeader, Stack } from '@/components/primitives';

/**
 * Suspense fallback for the lazily-loaded tab screens. Mirrors the typical
 * "header + 2 cards" layout so the user perceives placement, not a spinner.
 */
export function ScreenFallback() {
  return (
    <main className="scrollbar-hidden mx-auto h-[100dvh] w-full max-w-[490px] overflow-y-auto px-5 pb-[132px] pt-6">
      <Stack gap="xl" aria-busy="true" aria-live="polite">
        <ScreenHeader
          eyebrow={<span className="skeleton inline-block h-3 w-24 rounded-md" />}
          title={<span className="skeleton inline-block h-9 w-48 rounded-md" />}
          description={<span className="skeleton inline-block h-3 w-72 rounded-md" />}
        />
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
      </Stack>
    </main>
  );
}
