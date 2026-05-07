export const MATCHING_RULES = {
  maxSharedInterestScore: 30,
  sharedInterestPoints: 6,
  relationshipScore: 20,
  distanceScore: 15,
  distanceStepKm: 5,
  sharedLanguageScore: 10,
  sharedLanguagePoints: 5,
  moodScore: 10,
  lifestyleScore: 10,
  lifestylePoints: 5,
  profileCompletenessScore: 5,
  maxIcebreakers: 3,
  promptPreviewLength: 40,
} as const;

export const PROFILE_COMPLETENESS_CHECKS = [
  { key: 'photos', min: 2, suggestion: 'Add more photos (at least 2)' },
  { key: 'bio', min: 20, suggestion: 'Write a longer bio' },
  { key: 'interests', min: 3, suggestion: 'Add at least 3 interests' },
  { key: 'prompts', min: 1, suggestion: 'Answer a bio prompt' },
  { key: 'favoriteMusic', min: 1, suggestion: 'Add your favorite music' },
  { key: 'weekendActivity', min: 1, suggestion: 'Share your weekend activity' },
  { key: 'verified', min: 1, suggestion: 'Verify your profile' },
  { key: 'languages', min: 1, suggestion: 'Add languages you speak' },
  { key: 'mood', min: 1, suggestion: 'Set your current mood' },
  { key: 'job', min: 1, suggestion: 'Add your job title' },
] as const;
