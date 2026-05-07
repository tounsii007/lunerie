import { MATCHING_RULES, PROFILE_COMPLETENESS_CHECKS } from '@/data/dataConstants';

export interface BioPrompt {
  question: string;
  answer: string;
}

export type ProfileId = string;
export type Gender = 'male' | 'female';
export type SmokingHabit = 'never' | 'sometimes' | 'regularly';
export type DrinkingHabit = 'never' | 'sometimes' | 'socially' | 'regularly';
export type DegreeLevel = 'none' | 'bachelor' | 'master' | 'doctorate' | 'professor';
export type ChildrenPreference = 'none' | 'want' | 'have';
export type Religion = 'none' | 'muslim' | 'christian' | 'jewish' | 'buddhist' | 'hindu' | 'other';
export type RelationshipGoal = 'casual' | 'serious' | 'friendship' | 'undecided';
export type Mood = 'adventurous' | 'romantic' | 'chill' | 'social' | 'creative';
export type PetPreference = 'none' | 'dog' | 'cat' | 'both' | 'other';

export interface Profile {
  id: ProfileId;
  name: string;
  age: number;
  city: string;
  country: string;
  distance: number;
  bio: string;
  job: string;
  education: string;
  photos: string[];
  interests: string[];
  verified: boolean;
  gender: Gender;
  lastActive: string;
  lastActiveAt?: string;
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  languages: string[];
  degree: DegreeLevel;
  height: number;
  children: ChildrenPreference;
  religion: Religion;
  relationship: RelationshipGoal;
  // New UX fields
  prompts?: BioPrompt[];
  mood?: Mood | '';
  favoriteMusic?: string;
  weekendActivity?: string;
  pets?: PetPreference;
  zodiac?: string;
  compatibility?: number; // 0-100 calculated score
}

// Bio prompt questions for personality expression
export const BIO_PROMPTS = [
  "A perfect first date for me is...",
  "My most controversial opinion is...",
  "The way to my heart is...",
  "I\u2019m looking for someone who...",
  "My hidden talent is...",
  "Two truths and a lie...",
  "The best trip I\u2019ve ever taken...",
  "I\u2019m weirdly attracted to...",
  "My love language is...",
  "On Sundays you\u2019ll find me...",
  "The key to my heart is...",
  "I\u2019ll know it\u2019s love when...",
];

// Mood options for mood-based matching
export const MOODS = ['adventurous', 'romantic', 'chill', 'social', 'creative'] as const satisfies readonly Mood[];

export const MOOD_EMOJIS: Record<Mood, string> = {
  adventurous: '\uD83C\uDFD4\uFE0F',
  romantic: '\uD83C\uDF39',
  chill: '\u2615',
  social: '\uD83C\uDF89',
  creative: '\uD83C\uDFA8',
};

// Generate icebreakers based on profile data
export function generateIcebreakers(profile: Profile): string[] {
  const icebreakers: string[] = [];
  if (profile.interests.length > 0) {
    const interest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
    icebreakers.push(`Ask ${profile.name} about ${interest.toLowerCase()}`);
  }
  if (profile.favoriteMusic) {
    icebreakers.push(`${profile.name} loves ${profile.favoriteMusic}. Ask about a favorite song!`);
  }
  if (profile.weekendActivity) {
    icebreakers.push(`${profile.name} enjoys ${profile.weekendActivity} on weekends`);
  }
  if (profile.prompts && profile.prompts.length > 0) {
    const prompt = profile.prompts[0];
    icebreakers.push(`Ask about: "${prompt.answer.substring(0, MATCHING_RULES.promptPreviewLength)}..."`);
  }
  if (profile.mood) {
    icebreakers.push(`${profile.name} is feeling ${profile.mood} today ${MOOD_EMOJIS[profile.mood]}`);
  }
  if (profile.pets && profile.pets !== 'none') {
    icebreakers.push(`${profile.name} has a ${profile.pets}! Ask for photos`);
  }
  if (profile.languages.length > 1) {
    icebreakers.push(`${profile.name} speaks ${profile.languages.length} languages!`);
  }
  return icebreakers.slice(0, MATCHING_RULES.maxIcebreakers);
}

// Calculate compatibility between two profiles
export function calculateCompatibility(user: Profile, other: Profile): number {
  let score = 0;
  let factors = 0;

  // Shared interests (max 30 points)
  const sharedInterests = user.interests.filter(i => other.interests.includes(i));
  score += Math.min(sharedInterests.length * MATCHING_RULES.sharedInterestPoints, MATCHING_RULES.maxSharedInterestScore);
  factors += MATCHING_RULES.maxSharedInterestScore;

  // Same relationship goal (20 points)
  if (user.relationship === other.relationship) score += MATCHING_RULES.relationshipScore;
  factors += MATCHING_RULES.relationshipScore;

  // Distance (15 points - closer is better)
  score += Math.max(0, MATCHING_RULES.distanceScore - Math.floor(other.distance / MATCHING_RULES.distanceStepKm));
  factors += MATCHING_RULES.distanceScore;

  // Shared languages (10 points)
  const sharedLangs = user.languages.filter(l => other.languages.includes(l));
  score += Math.min(sharedLangs.length * MATCHING_RULES.sharedLanguagePoints, MATCHING_RULES.sharedLanguageScore);
  factors += MATCHING_RULES.sharedLanguageScore;

  // Same mood (10 points)
  if (user.mood && other.mood && user.mood === other.mood) score += MATCHING_RULES.moodScore;
  factors += MATCHING_RULES.moodScore;

  // Lifestyle compatibility (smoking/drinking - 10 points)
  if (user.smoking === other.smoking) score += MATCHING_RULES.lifestylePoints;
  if (user.drinking === other.drinking) score += MATCHING_RULES.lifestylePoints;
  factors += MATCHING_RULES.lifestyleScore;

  // Profile completeness of other (5 points)
  const completeness = (other.bio ? 1 : 0) + (other.photos.length > 1 ? 1 : 0) + ((other.prompts && other.prompts.length > 0) ? 1 : 0) + (other.verified ? 1 : 0) + (other.favoriteMusic ? 1 : 0);
  score += completeness;
  factors += MATCHING_RULES.profileCompletenessScore;

  return Math.round((score / factors) * 100);
}

// Calculate profile completeness percentage
export function calculateProfileCompleteness(profile: Profile): { percentage: number; suggestions: string[] } {
  const checks = PROFILE_COMPLETENESS_CHECKS.map((check) => {
    const suggestion = check.suggestion;
    switch (check.key) {
      case 'photos':
        return { done: profile.photos.length >= check.min, suggestion };
      case 'bio':
        return { done: profile.bio.length > check.min, suggestion };
      case 'interests':
        return { done: profile.interests.length >= check.min, suggestion };
      case 'prompts':
        return { done: (profile.prompts?.length || 0) >= check.min, suggestion };
      case 'favoriteMusic':
        return { done: (profile.favoriteMusic || '').length >= check.min, suggestion };
      case 'weekendActivity':
        return { done: (profile.weekendActivity || '').length >= check.min, suggestion };
      case 'verified':
        return { done: profile.verified, suggestion };
      case 'languages':
        return { done: profile.languages.length >= check.min, suggestion };
      case 'mood':
        return { done: (profile.mood || '').length >= check.min, suggestion };
      case 'job':
        return { done: profile.job.length >= check.min, suggestion };
    }
  });
  const done = checks.filter(c => c.done).length;
  const percentage = Math.round((done / checks.length) * 100);
  const suggestions = checks.filter(c => !c.done).map(c => c.suggestion);
  return { percentage, suggestions };
}

export interface Message {
  id: string;
  senderId: ProfileId | 'current';
  text: string;
  timestamp: string;
  createdAt?: string;
  image?: string;
  type?: 'text' | 'image' | 'voice' | 'call';
  duration?: number;
  callType?: 'voice' | 'video';
  reactions?: string[];
}

export interface Match {
  profile: Profile;
  messages: Message[];
  matchedAt: string;
  matchedAtIso?: string;
}

export const CITIES = {
  'Deutschland': ['Berlin', 'M\u00FCnchen', 'Hamburg', 'K\u00F6ln', 'Frankfurt', 'D\u00FCsseldorf', 'Stuttgart', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'N\u00FCrnberg'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Strasbourg', 'Lille', 'Nantes', 'Montpellier'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Liverpool', 'Leeds', 'Glasgow', 'Oxford', 'Cambridge'],
  'Italia': ['Roma', 'Milano', 'Firenze', 'Napoli', 'Torino', 'Venezia', 'Bologna', 'Palermo', 'Genova', 'Verona'],
  'Espa\u00F1a': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Malaga', 'Bilbao', 'Granada', 'Zaragoza'],
  'Portugal': ['Lisboa', 'Porto', 'Faro', 'Braga', 'Coimbra'],
  'Nederland': ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven'],
  'Belgique': ['Bruxelles', 'Antwerpen', 'Gent', 'Brugge', 'Li\u00E8ge'],
  'Schweiz': ['Z\u00FCrich', 'Bern', 'Basel', 'Genf', 'Luzern', 'Lausanne'],
  '\u00D6sterreich': ['Wien', 'Graz', 'Salzburg', 'Innsbruck', 'Linz'],
  'Polska': ['Warszawa', 'Krak\u00F3w', 'Wroc\u0142aw', 'Gda\u0144sk', 'Pozna\u0144'],
  '\u010Cesk\u00E1 republika': ['Praha', 'Brno', 'Ostrava', 'Plze\u0148'],
  'Sverige': ['Stockholm', 'G\u00F6teborg', 'Malm\u00F6', 'Uppsala'],
  'Norge': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
  'Danmark': ['K\u00F8benhavn', 'Aarhus', 'Odense', 'Aalborg'],
  'Suomi': ['Helsinki', 'Tampere', 'Turku', 'Oulu'],
  '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': ['Athina', 'Thessaloniki', 'Heraklion', 'Patras'],
  'T\u00FCrkiye': ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Adana', 'Trabzon'],
  '\u062A\u0648\u0646\u0633': ['Tunis', 'Sfax', 'Sousse', 'Mahdia', 'Monastir', 'Bizerte', 'Kairouan', 'Gab\u00E8s', 'Nabeul', 'Hammamet'],
  '\u0627\u0644\u0645\u063A\u0631\u0628': ['Casablanca', 'Rabat', 'Marrakech', 'F\u00E8s', 'Tanger', 'Agadir', 'Oujda'],
  '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna'],
  '\u0645\u0635\u0631': ['Kairo', 'Alexandria', 'Gizeh', 'Scharm el-Scheich', 'Luxor'],
  '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': ['Riad', 'Dschidda', 'Mekka', 'Medina', 'Dammam'],
  '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': ['Dubai', 'Abu Dhabi', 'Schardscha', 'Adschman'],
  '\u0644\u0628\u0646\u0627\u0646': ['Beirut', 'Tripoli', 'Sidon', 'Byblos'],
  '\u0627\u06CC\u0631\u0627\u0646': ['Teheran', 'Isfahan', 'Schiras', 'Tabris', 'Maschhad'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Houston', 'Seattle', 'Boston', 'Austin', 'Denver'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'],
  'Brasil': ['S\u00E3o Paulo', 'Rio de Janeiro', 'Bras\u00EDlia', 'Salvador', 'Fortaleza'],
  'M\u00E9xico': ['Ciudad de M\u00E9xico', 'Guadalajara', 'Monterrey', 'Canc\u00FAn', 'Puebla'],
  'Argentina': ['Buenos Aires', 'C\u00F3rdoba', 'Rosario', 'Mendoza'],
  '\u65E5\u672C': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
  '\uD55C\uAD6D': ['Seoul', 'Busan', 'Incheon', 'Daegu'],
  '\u4E2D\u56FD': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu'],
  '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'],
  '\u0E44\u0E17\u0E22': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  'Nigeria': ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu'],
} as const satisfies Record<string, readonly string[]>;
export type CountryKey = keyof typeof CITIES;

// Translated country names per language
export const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  de: { 'Deutschland': 'Deutschland', 'France': 'Frankreich', 'United Kingdom': 'Vereinigtes K\u00F6nigreich', 'Italia': 'Italien', 'Espa\u00F1a': 'Spanien', 'Portugal': 'Portugal', 'Nederland': 'Niederlande', 'Belgique': 'Belgien', 'Schweiz': 'Schweiz', '\u00D6sterreich': '\u00D6sterreich', 'Polska': 'Polen', '\u010Cesk\u00E1 republika': 'Tschechien', 'Sverige': 'Schweden', 'Norge': 'Norwegen', 'Danmark': 'D\u00E4nemark', 'Suomi': 'Finnland', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': 'Griechenland', 'T\u00FCrkiye': 'T\u00FCrkei', '\u062A\u0648\u0646\u0633': 'Tunesien', '\u0627\u0644\u0645\u063A\u0631\u0628': 'Marokko', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': 'Algerien', '\u0645\u0635\u0631': '\u00C4gypten', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': 'Saudi-Arabien', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': 'VAE', '\u0644\u0628\u0646\u0627\u0646': 'Libanon', '\u0627\u06CC\u0631\u0627\u0646': 'Iran', 'United States': 'USA', 'Canada': 'Kanada', 'Brasil': 'Brasilien', 'M\u00E9xico': 'Mexiko', 'Argentina': 'Argentinien', '\u65E5\u672C': 'Japan', '\uD55C\uAD6D': 'S\u00FCdkorea', '\u4E2D\u56FD': 'China', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928': 'Indien', '\u0E44\u0E17\u0E22': 'Thailand', 'Australia': 'Australien', 'South Africa': 'S\u00FCdafrika', 'Nigeria': 'Nigeria', 'Kenya': 'Kenia' },
  en: { 'Deutschland': 'Germany', 'France': 'France', 'United Kingdom': 'United Kingdom', 'Italia': 'Italy', 'Espa\u00F1a': 'Spain', 'Portugal': 'Portugal', 'Nederland': 'Netherlands', 'Belgique': 'Belgium', 'Schweiz': 'Switzerland', '\u00D6sterreich': 'Austria', 'Polska': 'Poland', '\u010Cesk\u00E1 republika': 'Czech Republic', 'Sverige': 'Sweden', 'Norge': 'Norway', 'Danmark': 'Denmark', 'Suomi': 'Finland', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': 'Greece', 'T\u00FCrkiye': 'Turkey', '\u062A\u0648\u0646\u0633': 'Tunisia', '\u0627\u0644\u0645\u063A\u0631\u0628': 'Morocco', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': 'Algeria', '\u0645\u0635\u0631': 'Egypt', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': 'Saudi Arabia', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': 'UAE', '\u0644\u0628\u0646\u0627\u0646': 'Lebanon', '\u0627\u06CC\u0631\u0627\u0646': 'Iran', 'United States': 'United States', 'Canada': 'Canada', 'Brasil': 'Brazil', 'M\u00E9xico': 'Mexico', 'Argentina': 'Argentina', '\u65E5\u672C': 'Japan', '\uD55C\uAD6D': 'South Korea', '\u4E2D\u56FD': 'China', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928': 'India', '\u0E44\u0E17\u0E22': 'Thailand', 'Australia': 'Australia', 'South Africa': 'South Africa', 'Nigeria': 'Nigeria', 'Kenya': 'Kenya' },
  fr: { 'Deutschland': 'Allemagne', 'France': 'France', 'United Kingdom': 'Royaume-Uni', 'Italia': 'Italie', 'Espa\u00F1a': 'Espagne', 'Portugal': 'Portugal', 'Nederland': 'Pays-Bas', 'Belgique': 'Belgique', 'Schweiz': 'Suisse', '\u00D6sterreich': 'Autriche', 'Polska': 'Pologne', '\u010Cesk\u00E1 republika': 'Tch\u00E9quie', 'Sverige': 'Su\u00E8de', 'Norge': 'Norv\u00E8ge', 'Danmark': 'Danemark', 'Suomi': 'Finlande', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': 'Gr\u00E8ce', 'T\u00FCrkiye': 'Turquie', '\u062A\u0648\u0646\u0633': 'Tunisie', '\u0627\u0644\u0645\u063A\u0631\u0628': 'Maroc', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': 'Alg\u00E9rie', '\u0645\u0635\u0631': '\u00C9gypte', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': 'Arabie Saoudite', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': '\u00C9AU', '\u0644\u0628\u0646\u0627\u0646': 'Liban', '\u0627\u06CC\u0631\u0627\u0646': 'Iran', 'United States': '\u00C9tats-Unis', 'Canada': 'Canada', 'Brasil': 'Br\u00E9sil', 'M\u00E9xico': 'Mexique', 'Argentina': 'Argentine', '\u65E5\u672C': 'Japon', '\uD55C\uAD6D': 'Cor\u00E9e du Sud', '\u4E2D\u56FD': 'Chine', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928': 'Inde', '\u0E44\u0E17\u0E22': 'Tha\u00EFlande', 'Australia': 'Australie', 'South Africa': 'Afrique du Sud', 'Nigeria': 'Nigeria', 'Kenya': 'Kenya' },
  ar: { 'Deutschland': '\u0623\u0644\u0645\u0627\u0646\u064A\u0627', 'France': '\u0641\u0631\u0646\u0633\u0627', 'United Kingdom': '\u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0627', 'Italia': '\u0625\u064A\u0637\u0627\u0644\u064A\u0627', 'Espa\u00F1a': '\u0625\u0633\u0628\u0627\u0646\u064A\u0627', 'Portugal': '\u0627\u0644\u0628\u0631\u062A\u063A\u0627\u0644', 'Nederland': '\u0647\u0648\u0644\u0646\u062F\u0627', 'Belgique': '\u0628\u0644\u062C\u064A\u0643\u0627', 'Schweiz': '\u0633\u0648\u064A\u0633\u0631\u0627', '\u00D6sterreich': '\u0627\u0644\u0646\u0645\u0633\u0627', 'Polska': '\u0628\u0648\u0644\u0646\u062F\u0627', '\u010Cesk\u00E1 republika': '\u0627\u0644\u062A\u0634\u064A\u0643', 'Sverige': '\u0627\u0644\u0633\u0648\u064A\u062F', 'Norge': '\u0627\u0644\u0646\u0631\u0648\u064A\u062C', 'Danmark': '\u0627\u0644\u062F\u0646\u0645\u0627\u0631\u0643', 'Suomi': '\u0641\u0646\u0644\u0646\u062F\u0627', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': '\u0627\u0644\u064A\u0648\u0646\u0627\u0646', 'T\u00FCrkiye': '\u062A\u0631\u0643\u064A\u0627', '\u062A\u0648\u0646\u0633': '\u062A\u0648\u0646\u0633', '\u0627\u0644\u0645\u063A\u0631\u0628': '\u0627\u0644\u0645\u063A\u0631\u0628', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': '\u0627\u0644\u062C\u0632\u0627\u0626\u0631', '\u0645\u0635\u0631': '\u0645\u0635\u0631', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A', '\u0644\u0628\u0646\u0627\u0646': '\u0644\u0628\u0646\u0627\u0646', '\u0627\u06CC\u0631\u0627\u0646': '\u0625\u064A\u0631\u0627\u0646', 'United States': '\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629', 'Canada': '\u0643\u0646\u062F\u0627', 'Brasil': '\u0627\u0644\u0628\u0631\u0627\u0632\u064A\u0644', 'M\u00E9xico': '\u0627\u0644\u0645\u0643\u0633\u064A\u0643', 'Argentina': '\u0627\u0644\u0623\u0631\u062C\u0646\u062A\u064A\u0646', '\u65E5\u672C': '\u0627\u0644\u064A\u0627\u0628\u0627\u0646', '\uD55C\uAD6D': '\u0643\u0648\u0631\u064A\u0627 \u0627\u0644\u062C\u0646\u0648\u0628\u064A\u0629', '\u4E2D\u56FD': '\u0627\u0644\u0635\u064A\u0646', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0646': '\u0627\u0644\u0647\u0646\u062F', '\u0E44\u0E17\u0E22': '\u062A\u0627\u064A\u0644\u0627\u0646\u062F', 'Australia': '\u0623\u0633\u062A\u0631\u0627\u0644\u064A\u0627', 'South Africa': '\u062C\u0646\u0648\u0628 \u0623\u0641\u0631\u064A\u0642\u064A\u0627', 'Nigeria': '\u0646\u064A\u062C\u064A\u0631\u064A\u0627', 'Kenya': '\u0643\u064A\u0646\u064A\u0627' },
  fa: { 'Deutschland': '\u0622\u0644\u0645\u0627\u0646', 'France': '\u0641\u0631\u0627\u0646\u0633\u0647', 'United Kingdom': '\u0628\u0631\u06CC\u062A\u0627\u0646\u06CC\u0627', 'Italia': '\u0627\u06CC\u062A\u0627\u0644\u06CC\u0627', 'Espa\u00F1a': '\u0627\u0633\u067E\u0627\u0646\u06CC\u0627', 'Portugal': '\u067E\u0631\u062A\u063A\u0627\u0644', 'Nederland': '\u0647\u0644\u0646\u062F', 'Belgique': '\u0628\u0644\u0698\u06CC\u06A9', 'Schweiz': '\u0633\u0648\u0626\u06CC\u0633', '\u00D6sterreich': '\u0627\u062A\u0631\u06CC\u0634', 'Polska': '\u0644\u0647\u0633\u062A\u0627\u0646', '\u010Cesk\u00E1 republika': '\u0686\u06A9', 'Sverige': '\u0633\u0648\u0626\u062F', 'Norge': '\u0646\u0631\u0648\u0698', 'Danmark': '\u062F\u0627\u0646\u0645\u0627\u0631\u06A9', 'Suomi': '\u0641\u0646\u0644\u0627\u0646\u062F', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': '\u06CC\u0648\u0646\u0627\u0646', 'T\u00FCrkiye': '\u062A\u0631\u06A9\u06CC\u0647', '\u062A\u0648\u0646\u0633': '\u062A\u0648\u0646\u0633', '\u0627\u0644\u0645\u063A\u0631\u0628': '\u0645\u0631\u0627\u06A9\u0634', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': '\u0627\u0644\u062C\u0632\u0627\u06CC\u0631', '\u0645\u0635\u0631': '\u0645\u0635\u0631', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': '\u0639\u0631\u0628\u0633\u062A\u0627\u0646', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': '\u0627\u0645\u0627\u0631\u0627\u062A', '\u0644\u0628\u0646\u0627\u0646': '\u0644\u0628\u0646\u0627\u0646', '\u0627\u06CC\u0631\u0627\u0646': '\u0627\u06CC\u0631\u0627\u0646', 'United States': '\u0622\u0645\u0631\u06CC\u06A9\u0627', 'Canada': '\u06A9\u0627\u0646\u0627\u062F\u0627', 'Brasil': '\u0628\u0631\u0632\u06CC\u0644', 'M\u00E9xico': '\u0645\u06A9\u0632\u06CC\u06A9', 'Argentina': '\u0622\u0631\u0698\u0627\u0646\u062A\u06CC\u0646', '\u65E5\u672C': '\u0698\u0627\u067E\u0646', '\uD55C\uAD6D': '\u06A9\u0631\u0647 \u062C\u0646\u0648\u0628\u06CC', '\u4E2D\u56FD': '\u0686\u06CC\u0646', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0646': '\u0647\u0646\u062F', '\u0E44\u0E17\u0E22': '\u062A\u0627\u06CC\u0644\u0646\u062F', 'Australia': '\u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627', 'South Africa': '\u0622\u0641\u0631\u06CC\u0642\u0627\u06CC \u062C\u0646\u0648\u0628\u06CC', 'Nigeria': '\u0646\u06CC\u062C\u0631\u06CC\u0647', 'Kenya': '\u06A9\u0646\u06CC\u0627' },
  tr: { 'Deutschland': 'Almanya', 'France': 'Fransa', 'United Kingdom': 'Birle\u015Fik Krall\u0131k', 'Italia': '\u0130talya', 'Espa\u00F1a': '\u0130spanya', 'Portugal': 'Portekiz', 'Nederland': 'Hollanda', 'Belgique': 'Bel\u00E7ika', 'Schweiz': '\u0130svi\u00E7re', '\u00D6sterreich': 'Avusturya', 'Polska': 'Polonya', '\u010Cesk\u00E1 republika': '\u00C7ekya', 'Sverige': '\u0130sve\u00E7', 'Norge': 'Norve\u00E7', 'Danmark': 'Danimarka', 'Suomi': 'Finlandiya', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': 'Yunanistan', 'T\u00FCrkiye': 'T\u00FCrkiye', '\u062A\u0648\u0646\u0633': 'Tunus', '\u0627\u0644\u0645\u063A\u0631\u0628': 'Fas', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': 'Cezayir', '\u0645\u0635\u0631': 'M\u0131s\u0131r', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': 'Suudi Arabistan', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': 'BAE', '\u0644\u0628\u0646\u0627\u0646': 'L\u00FCbnan', '\u0627\u06CC\u0631\u0627\u0646': '\u0130ran', 'United States': 'ABD', 'Canada': 'Kanada', 'Brasil': 'Brezilya', 'M\u00E9xico': 'Meksika', 'Argentina': 'Arjantin', '\u65E5\u672C': 'Japonya', '\uD55C\uAD6D': 'G\u00FCney Kore', '\u4E2D\u56FD': '\u00C7in', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928': 'Hindistan', '\u0E44\u0E17\u0E22': 'Tayland', 'Australia': 'Avustralya', 'South Africa': 'G\u00FCney Afrika', 'Nigeria': 'Nijerya', 'Kenya': 'Kenya' },
  es: { 'Deutschland': 'Alemania', 'France': 'Francia', 'United Kingdom': 'Reino Unido', 'Italia': 'Italia', 'Espa\u00F1a': 'Espa\u00F1a', 'Portugal': 'Portugal', 'Nederland': 'Pa\u00EDses Bajos', 'Belgique': 'B\u00E9lgica', 'Schweiz': 'Suiza', '\u00D6sterreich': 'Austria', 'Polska': 'Polonia', '\u010Cesk\u00E1 republika': 'Chequia', 'Sverige': 'Suecia', 'Norge': 'Noruega', 'Danmark': 'Dinamarca', 'Suomi': 'Finlandia', '\u0395\u03BB\u03BB\u03AC\u03B4\u03B1': 'Grecia', 'T\u00FCrkiye': 'Turqu\u00EDa', '\u062A\u0648\u0646\u0633': 'T\u00FAnez', '\u0627\u0644\u0645\u063A\u0631\u0628': 'Marruecos', '\u0627\u0644\u062C\u0632\u0627\u0626\u0631': 'Argelia', '\u0645\u0635\u0631': 'Egipto', '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629': 'Arabia Saudita', '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A': 'EAU', '\u0644\u0628\u0646\u0627\u0646': 'L\u00EDbano', '\u0627\u06CC\u0631\u0627\u0646': 'Ir\u00E1n', 'United States': 'EE.UU.', 'Canada': 'Canad\u00E1', 'Brasil': 'Brasil', 'M\u00E9xico': 'M\u00E9xico', 'Argentina': 'Argentina', '\u65E5\u672C': 'Jap\u00F3n', '\uD55C\uAD6D': 'Corea del Sur', '\u4E2D\u56FD': 'China', '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928': 'India', '\u0E44\u0E17\u0E22': 'Tailandia', 'Australia': 'Australia', 'South Africa': 'Sud\u00E1frica', 'Nigeria': 'Nigeria', 'Kenya': 'Kenia' },
};

export function getCountryName(internalName: string, lang: string): string {
  return COUNTRY_NAMES[lang]?.[internalName] || COUNTRY_NAMES['en']?.[internalName] || internalName;
}

// City name translations for Arabic and Persian
const CITY_TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    // Egypt
    'Kairo': '\u0627\u0644\u0642\u0627\u0647\u0631\u0629', 'Alexandria': '\u0627\u0644\u0625\u0633\u0643\u0646\u062F\u0631\u064A\u0629', 'Gizeh': '\u0627\u0644\u062C\u064A\u0632\u0629', 'Scharm el-Scheich': '\u0634\u0631\u0645 \u0627\u0644\u0634\u064A\u062E', 'Luxor': '\u0627\u0644\u0623\u0642\u0635\u0631',
    // Saudi
    'Riad': '\u0627\u0644\u0631\u064A\u0627\u0636', 'Dschidda': '\u062C\u062F\u0629', 'Mekka': '\u0645\u0643\u0629', 'Medina': '\u0627\u0644\u0645\u062F\u064A\u0646\u0629', 'Dammam': '\u0627\u0644\u062F\u0645\u0627\u0645',
    // UAE
    'Dubai': '\u062F\u0628\u064A', 'Abu Dhabi': '\u0623\u0628\u0648\u0638\u0628\u064A', 'Schardscha': '\u0627\u0644\u0634\u0627\u0631\u0642\u0629', 'Adschman': '\u0639\u062C\u0645\u0627\u0646',
    // Lebanon
    'Beirut': '\u0628\u064A\u0631\u0648\u062A', 'Tripoli': '\u0637\u0631\u0627\u0628\u0644\u0633', 'Sidon': '\u0635\u064A\u062F\u0627', 'Byblos': '\u062C\u0628\u064A\u0644',
    // Iran
    'Teheran': '\u0637\u0647\u0631\u0627\u0646', 'Isfahan': '\u0623\u0635\u0641\u0647\u0627\u0646', 'Schiras': '\u0634\u064A\u0631\u0627\u0632', 'Tabris': '\u062A\u0628\u0631\u064A\u0632', 'Maschhad': '\u0645\u0634\u0647\u062F',
    // Tunisia
    'Tunis': '\u062A\u0648\u0646\u0633', 'Sfax': '\u0635\u0641\u0627\u0642\u0633', 'Sousse': '\u0633\u0648\u0633\u0629', 'Mahdia': '\u0627\u0644\u0645\u0647\u062F\u064A\u0629', 'Monastir': '\u0627\u0644\u0645\u0646\u0633\u062A\u064A\u0631', 'Bizerte': '\u0628\u0646\u0632\u0631\u062A', 'Kairouan': '\u0627\u0644\u0642\u064A\u0631\u0648\u0627\u0646', 'Nabeul': '\u0646\u0627\u0628\u0644', 'Hammamet': '\u0627\u0644\u062D\u0645\u0627\u0645\u0627\u062A', 'Gab\u00E8s': '\u0642\u0627\u0628\u0633',
    // Morocco
    'Casablanca': '\u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621', 'Rabat': '\u0627\u0644\u0631\u0628\u0627\u0637', 'Marrakech': '\u0645\u0631\u0627\u0643\u0634', 'F\u00E8s': '\u0641\u0627\u0633', 'Tanger': '\u0637\u0646\u062C\u0629', 'Agadir': '\u0623\u063A\u0627\u062F\u064A\u0631', 'Oujda': '\u0648\u062C\u062F\u0629',
    // Algeria
    'Alger': '\u0627\u0644\u062C\u0632\u0627\u0626\u0631', 'Oran': '\u0648\u0647\u0631\u0627\u0646', 'Constantine': '\u0642\u0633\u0646\u0637\u064A\u0646\u0629', 'Annaba': '\u0639\u0646\u0627\u0628\u0629', 'Blida': '\u0627\u0644\u0628\u0644\u064A\u062F\u0629', 'Batna': '\u0628\u0627\u062A\u0646\u0629',
    // Turkey
    'Istanbul': '\u0625\u0633\u0637\u0646\u0628\u0648\u0644', 'Ankara': '\u0623\u0646\u0642\u0631\u0629', 'Izmir': '\u0625\u0632\u0645\u064A\u0631', 'Antalya': '\u0623\u0646\u0637\u0627\u0644\u064A\u0627', 'Bursa': '\u0628\u0648\u0631\u0635\u0629', 'Adana': '\u0623\u0636\u0646\u0629', 'Trabzon': '\u0637\u0631\u0627\u0628\u0632\u0648\u0646',
    // Germany
    'Berlin': '\u0628\u0631\u0644\u064A\u0646', 'M\u00FCnchen': '\u0645\u064A\u0648\u0646\u062E', 'Hamburg': '\u0647\u0627\u0645\u0628\u0648\u0631\u063A', 'K\u00F6ln': '\u0643\u0648\u0644\u0648\u0646\u064A\u0627', 'Frankfurt': '\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A', 'D\u00FCsseldorf': '\u062F\u0648\u0633\u0644\u062F\u0648\u0631\u0641', 'Stuttgart': '\u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A', 'Dortmund': '\u062F\u0648\u0631\u062A\u0645\u0648\u0646\u062F', 'Leipzig': '\u0644\u0627\u064A\u0628\u0632\u064A\u063A', 'Dresden': '\u062F\u0631\u064A\u0632\u062F\u0646', 'Hannover': '\u0647\u0627\u0646\u0648\u0641\u0631', 'N\u00FCrnberg': '\u0646\u0648\u0631\u0646\u0628\u0631\u063A', 'Bremen': '\u0628\u0631\u064A\u0645\u0646', 'Essen': '\u0625\u064A\u0633\u0646',
    // France
    'Paris': '\u0628\u0627\u0631\u064A\u0633', 'Lyon': '\u0644\u064A\u0648\u0646', 'Marseille': '\u0645\u0627\u0631\u0633\u064A\u0644\u064A\u0627', 'Toulouse': '\u062A\u0648\u0644\u0648\u0632', 'Nice': '\u0646\u064A\u0633', 'Bordeaux': '\u0628\u0648\u0631\u062F\u0648', 'Strasbourg': '\u0633\u062A\u0631\u0627\u0633\u0628\u0648\u0631\u063A', 'Lille': '\u0644\u064A\u0644', 'Nantes': '\u0646\u0627\u0646\u062A', 'Montpellier': '\u0645\u0648\u0646\u0628\u0644\u064A\u064A\u0647',
    // UK
    'London': '\u0644\u0646\u062F\u0646', 'Manchester': '\u0645\u0627\u0646\u0634\u0633\u062A\u0631', 'Birmingham': '\u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645', 'Edinburgh': '\u0625\u062F\u0646\u0628\u0631\u0629', 'Bristol': '\u0628\u0631\u064A\u0633\u062A\u0648\u0644', 'Liverpool': '\u0644\u064A\u0641\u0631\u0628\u0648\u0644', 'Leeds': '\u0644\u064A\u062F\u0632', 'Glasgow': '\u063A\u0644\u0627\u0633\u0643\u0648', 'Oxford': '\u0623\u0648\u0643\u0633\u0641\u0648\u0631\u062F', 'Cambridge': '\u0643\u0627\u0645\u0628\u0631\u064A\u062F\u062C',
    // Italy
    'Roma': '\u0631\u0648\u0645\u0627', 'Milano': '\u0645\u064A\u0644\u0627\u0646\u0648', 'Firenze': '\u0641\u0644\u0648\u0631\u0646\u0633\u0627', 'Napoli': '\u0646\u0627\u0628\u0648\u0644\u064A', 'Torino': '\u062A\u0648\u0631\u064A\u0646\u0648', 'Venezia': '\u0627\u0644\u0628\u0646\u062F\u0642\u064A\u0629', 'Bologna': '\u0628\u0648\u0644\u0648\u0646\u064A\u0627', 'Palermo': '\u0628\u0627\u0644\u064A\u0631\u0645\u0648', 'Genova': '\u062C\u0646\u0648\u0629', 'Verona': '\u0641\u064A\u0631\u0648\u0646\u0627',
    // Spain
    'Madrid': '\u0645\u062F\u0631\u064A\u062F', 'Barcelona': '\u0628\u0631\u0634\u0644\u0648\u0646\u0629', 'Valencia': '\u0641\u0627\u0644\u0646\u0633\u064A\u0627', 'Sevilla': '\u0625\u0634\u0628\u064A\u0644\u064A\u0629', 'Malaga': '\u0645\u0627\u0644\u0642\u0629', 'Granada': '\u063A\u0631\u0646\u0627\u0637\u0629',
    // Other Europe
    'Lisboa': '\u0644\u0634\u0628\u0648\u0646\u0629', 'Porto': '\u0628\u0648\u0631\u062A\u0648', 'Amsterdam': '\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645', 'Rotterdam': '\u0631\u0648\u062A\u0631\u062F\u0627\u0645', 'Bruxelles': '\u0628\u0631\u0648\u0643\u0633\u0644', 'Z\u00FCrich': '\u0632\u064A\u0648\u0631\u064A\u062E', 'Bern': '\u0628\u0631\u0646', 'Genf': '\u062C\u0646\u064A\u0641', 'Wien': '\u0641\u064A\u064A\u0646\u0627', 'Graz': '\u063A\u0631\u0627\u062A\u0633', 'Salzburg': '\u0633\u0627\u0644\u0632\u0628\u0648\u0631\u063A',
    'Warszawa': '\u0648\u0627\u0631\u0633\u0648', 'Krak\u00F3w': '\u0643\u0631\u0627\u0643\u0648\u0641', 'Praha': '\u0628\u0631\u0627\u063A', 'Stockholm': '\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645', 'Oslo': '\u0623\u0648\u0633\u0644\u0648', 'K\u00F8benhavn': '\u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646', 'Helsinki': '\u0647\u0644\u0633\u0646\u0643\u064A', 'Athina': '\u0623\u062B\u064A\u0646\u0627',
    // Americas
    'New York': '\u0646\u064A\u0648\u064A\u0648\u0631\u0643', 'Los Angeles': '\u0644\u0648\u0633 \u0623\u0646\u062C\u0644\u0648\u0633', 'Chicago': '\u0634\u064A\u0643\u0627\u063A\u0648', 'Miami': '\u0645\u064A\u0627\u0645\u064A', 'San Francisco': '\u0633\u0627\u0646 \u0641\u0631\u0627\u0646\u0633\u064A\u0633\u0643\u0648', 'Houston': '\u0647\u064A\u0648\u0633\u062A\u0646', 'Toronto': '\u062A\u0648\u0631\u0646\u062A\u0648', 'Vancouver': '\u0641\u0627\u0646\u0643\u0648\u0641\u0631', 'Montreal': '\u0645\u0648\u0646\u062A\u0631\u064A\u0627\u0644',
    'S\u00E3o Paulo': '\u0633\u0627\u0648 \u0628\u0627\u0648\u0644\u0648', 'Rio de Janeiro': '\u0631\u064A\u0648 \u062F\u064A \u062C\u0627\u0646\u064A\u0631\u0648', 'Buenos Aires': '\u0628\u0648\u064A\u0646\u0633 \u0622\u064A\u0631\u0633',
    // Asia
    'Tokyo': '\u0637\u0648\u0643\u064A\u0648', 'Osaka': '\u0623\u0648\u0633\u0627\u0643\u0627', 'Seoul': '\u0633\u064A\u0648\u0644', 'Beijing': '\u0628\u0643\u064A\u0646', 'Shanghai': '\u0634\u0646\u063A\u0647\u0627\u064A', 'Mumbai': '\u0645\u0648\u0645\u0628\u0627\u064A', 'Delhi': '\u062F\u0644\u0647\u064A', 'Bangkok': '\u0628\u0627\u0646\u0643\u0648\u0643',
    // Oceania/Africa
    'Sydney': '\u0633\u064A\u062F\u0646\u064A', 'Melbourne': '\u0645\u0644\u0628\u0648\u0631\u0646', 'Cape Town': '\u0643\u064A\u0628 \u062A\u0627\u0648\u0646', 'Lagos': '\u0644\u0627\u063A\u0648\u0633', 'Nairobi': '\u0646\u064A\u0631\u0648\u0628\u064A',
  },
  fa: {
    // Iran
    'Teheran': '\u062A\u0647\u0631\u0627\u0646', 'Isfahan': '\u0627\u0635\u0641\u0647\u0627\u0646', 'Schiras': '\u0634\u06CC\u0631\u0627\u0632', 'Tabris': '\u062A\u0628\u0631\u06CC\u0632', 'Maschhad': '\u0645\u0634\u0647\u062F',
    // UAE/Lebanon/Egypt/Saudi
    'Dubai': '\u062F\u0628\u06CC', 'Abu Dhabi': '\u0627\u0628\u0648\u0638\u0628\u06CC', 'Schardscha': '\u0634\u0627\u0631\u062C\u0647', 'Adschman': '\u0639\u062C\u0645\u0627\u0646',
    'Beirut': '\u0628\u06CC\u0631\u0648\u062A', 'Tripoli': '\u0637\u0631\u0627\u0628\u0644\u0633', 'Sidon': '\u0635\u06CC\u062F\u0627', 'Byblos': '\u062C\u0628\u06CC\u0644',
    'Kairo': '\u0642\u0627\u0647\u0631\u0647', 'Alexandria': '\u0627\u0633\u06A9\u0646\u062F\u0631\u06CC\u0647', 'Gizeh': '\u062C\u06CC\u0632\u0647', 'Luxor': '\u0627\u0642\u0635\u0631',
    'Riad': '\u0631\u06CC\u0627\u0636', 'Dschidda': '\u062C\u062F\u0647', 'Mekka': '\u0645\u06A9\u0647', 'Medina': '\u0645\u062F\u06CC\u0646\u0647', 'Dammam': '\u062F\u0645\u0627\u0645',
    // Tunisia
    'Tunis': '\u062A\u0648\u0646\u0633', 'Sfax': '\u0635\u0641\u0627\u0642\u0633', 'Sousse': '\u0633\u0648\u0633\u0647', 'Mahdia': '\u0645\u0647\u062F\u06CC\u0647', 'Monastir': '\u0645\u0646\u0633\u062A\u06CC\u0631', 'Bizerte': '\u0628\u0646\u0632\u0631\u062A', 'Kairouan': '\u0642\u06CC\u0631\u0648\u0627\u0646', 'Nabeul': '\u0646\u0627\u0628\u0644', 'Hammamet': '\u062D\u0645\u0627\u0645\u0627\u062A', 'Gab\u00E8s': '\u0642\u0627\u0628\u0633',
    // Morocco
    'Casablanca': '\u06A9\u0627\u0632\u0627\u0628\u0644\u0627\u0646\u06A9\u0627', 'Rabat': '\u0631\u0628\u0627\u0637', 'Marrakech': '\u0645\u0631\u0627\u06A9\u0634', 'F\u00E8s': '\u0641\u0627\u0633', 'Tanger': '\u0637\u0646\u062C\u0647', 'Agadir': '\u0627\u063A\u0627\u062F\u06CC\u0631', 'Oujda': '\u0648\u062C\u062F\u0647',
    // Algeria
    'Alger': '\u0627\u0644\u062C\u0632\u0627\u06CC\u0631', 'Oran': '\u0648\u0647\u0631\u0627\u0646', 'Constantine': '\u0642\u0633\u0646\u0637\u06CC\u0646\u0647', 'Annaba': '\u0639\u0646\u0627\u0628\u0647', 'Blida': '\u0628\u0644\u06CC\u062F\u0647', 'Batna': '\u0628\u0627\u062A\u0646\u0647',
    // Turkey
    'Istanbul': '\u0627\u0633\u062A\u0627\u0646\u0628\u0648\u0644', 'Ankara': '\u0622\u0646\u06A9\u0627\u0631\u0627', 'Izmir': '\u0627\u0632\u0645\u06CC\u0631', 'Antalya': '\u0622\u0646\u062A\u0627\u0644\u06CC\u0627', 'Bursa': '\u0628\u0648\u0631\u0633\u0627',
    // Germany
    'Berlin': '\u0628\u0631\u0644\u06CC\u0646', 'M\u00FCnchen': '\u0645\u0648\u0646\u06CC\u062E', 'Hamburg': '\u0647\u0627\u0645\u0628\u0648\u0631\u06AF', 'K\u00F6ln': '\u06A9\u0644\u0646', 'Frankfurt': '\u0641\u0631\u0627\u0646\u06A9\u0641\u0648\u0631\u062A', 'Stuttgart': '\u0634\u062A\u0648\u062A\u06AF\u0627\u0631\u062A',
    // France
    'Paris': '\u067E\u0627\u0631\u06CC\u0633', 'Lyon': '\u0644\u06CC\u0648\u0646', 'Marseille': '\u0645\u0627\u0631\u0633\u06CC', 'Nice': '\u0646\u06CC\u0633', 'Bordeaux': '\u0628\u0631\u062F\u0648',
    // UK
    'London': '\u0644\u0646\u062F\u0646', 'Manchester': '\u0645\u0646\u0686\u0633\u062A\u0631', 'Birmingham': '\u0628\u0631\u0645\u06CC\u0646\u06AF\u0627\u0645', 'Edinburgh': '\u0627\u062F\u06CC\u0646\u0628\u0648\u0631\u06AF', 'Liverpool': '\u0644\u06CC\u0648\u0631\u067E\u0648\u0644',
    // Italy
    'Roma': '\u0631\u0645', 'Milano': '\u0645\u06CC\u0644\u0627\u0646', 'Firenze': '\u0641\u0644\u0648\u0631\u0627\u0646\u0633', 'Napoli': '\u0646\u0627\u067E\u0644', 'Venezia': '\u0648\u0646\u06CC\u0632',
    // Spain
    'Madrid': '\u0645\u062F\u0631\u06CC\u062F', 'Barcelona': '\u0628\u0627\u0631\u0633\u0644\u0648\u0646\u0627',
    // Other
    'Wien': '\u0648\u06CC\u0646', 'Z\u00FCrich': '\u0632\u0648\u0631\u06CC\u062E', 'Amsterdam': '\u0622\u0645\u0633\u062A\u0631\u062F\u0627\u0645', 'Bruxelles': '\u0628\u0631\u0648\u06A9\u0633\u0644', 'Lisboa': '\u0644\u06CC\u0633\u0628\u0648\u0646', 'Warszawa': '\u0648\u0627\u0631\u0633\u0648', 'Praha': '\u067E\u0631\u0627\u06AF', 'Stockholm': '\u0627\u0633\u062A\u06A9\u0647\u0644\u0645', 'Oslo': '\u0627\u0633\u0644\u0648', 'Athina': '\u0622\u062A\u0646',
    'New York': '\u0646\u06CC\u0648\u06CC\u0648\u0631\u06A9', 'Los Angeles': '\u0644\u0633 \u0622\u0646\u062C\u0644\u0633', 'Tokyo': '\u062A\u0648\u06A9\u06CC\u0648', 'Seoul': '\u0633\u0626\u0648\u0644', 'Beijing': '\u067E\u06A9\u0646', 'Mumbai': '\u0645\u0648\u0645\u0628\u0626\u06CC', 'Sydney': '\u0633\u06CC\u062F\u0646\u06CC',
  },
};

export function getCityName(city: string, lang: string): string {
  return CITY_TRANSLATIONS[lang]?.[city] || city;
}

const photoPool = {
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1464863979621-258859e62245?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502685104813-96d4290cc3e4?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506956191951-7a88da4435e5?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1523264653568-d3d4a42e1468?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=600&h=800&fit=crop',
  ],
  male: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?w=600&h=800&fit=crop',
  ],
};

function getPhotos(gender: 'male' | 'female', index: number): string[] {
  const pool = photoPool[gender];
  const start = (index * 3) % pool.length;
  return [pool[start], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]];
}

export const mockProfiles: Profile[] = [
  { id: '1', name: 'Sophie', age: 26, city: 'Berlin', country: 'Deutschland', distance: 3, bio: 'Architektin mit Leidenschaft f\u00FCr nachhaltiges Design. Flohm\u00E4rkte und Kaffee an der Spree.', job: 'Architektin', education: 'TU Berlin', photos: getPhotos('female', 0), interests: ['Architecture', 'Coffee', 'Art', 'Sustainability', 'Travel'], verified: true, gender: 'female', lastActive: '2min', smoking: 'never', drinking: 'socially', languages: ['Deutsch', 'English', 'French'], degree: 'master', height: 170, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "A perfect first date for me is...", answer: "Exploring a hidden street art gallery, then coffee at a rooftop cafe" }], mood: 'creative', favoriteMusic: 'Indie Rock', weekendActivity: 'Visiting flea markets and art galleries', pets: 'cat', zodiac: 'Aquarius' },
  { id: '2', name: 'Maximilian', age: 29, city: 'M\u00FCnchen', country: 'Deutschland', distance: 5, bio: 'Software Engineer by day, guitarist by night. Beer garden sessions and Alpine trips.', job: 'Senior Developer bei BMW', education: 'LMU M\u00FCnchen', photos: getPhotos('male', 0), interests: ['Music', 'Hiking', 'Technology', 'Guitar'], verified: true, gender: 'male', lastActive: '15min', smoking: 'never', drinking: 'socially', languages: ['Deutsch', 'English'], degree: 'master', height: 183, children: 'none', religion: 'christian', relationship: 'serious', prompts: [{ question: "On Sundays you'll find me...", answer: "Jamming on my guitar at a beer garden or hiking in the Alps" }], mood: 'adventurous', favoriteMusic: 'Rock', weekendActivity: 'Hiking in the Bavarian Alps', pets: 'dog', zodiac: 'Capricorn' },
  { id: '3', name: 'Camille', age: 24, city: 'Paris', country: 'France', distance: 8, bio: 'Photographe et amoureuse de cuisine fran\u00E7aise. Explorons les march\u00E9s parisiens ensemble!', job: 'Photographe freelance', education: 'Sciences Po Paris', photos: getPhotos('female', 1), interests: ['Photography', 'Cooking', 'Wine', 'Fashion', 'Cinema'], verified: true, gender: 'female', lastActive: '1h', smoking: 'sometimes', drinking: 'socially', languages: ['French', 'English', 'Spanish'], degree: 'bachelor', height: 165, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "The way to my heart is...", answer: "A surprise picnic by the Seine with wine and good conversation" }, { question: "My hidden talent is...", answer: "I can guess any wine region blindfolded" }], mood: 'romantic', favoriteMusic: 'French Pop', weekendActivity: 'Exploring Parisian markets and shooting film photography', pets: 'none', zodiac: 'Pisces' },
  { id: '4', name: 'Luca', age: 27, city: 'Milano', country: 'Italia', distance: 12, bio: 'Fashion designer con passione per il buon cibo e il vino italiano.', job: 'Fashion Designer', education: 'Politecnico di Milano', photos: getPhotos('male', 1), interests: ['Fashion', 'Food', 'Wine', 'Travel', 'Art'], verified: false, gender: 'male', lastActive: '30min', smoking: 'sometimes', drinking: 'socially', languages: ['Italian', 'English', 'French'], degree: 'bachelor', height: 178, children: 'none', religion: 'christian', relationship: 'casual', prompts: [{ question: "My most controversial opinion is...", answer: "Pineapple on pizza is actually genius if done right" }], mood: 'creative', favoriteMusic: 'Italian Pop', weekendActivity: 'Browsing vintage shops and trying new restaurants', pets: 'none', zodiac: 'Libra' },
  { id: '5', name: 'Emily', age: 25, city: 'London', country: 'United Kingdom', distance: 4, bio: 'Marketing manager exploring London\'s food scene. Runner, bookworm, yoga enthusiast.', job: 'Marketing Manager at Spotify', education: 'UCL', photos: getPhotos('female', 2), interests: ['Running', 'Reading', 'Yoga', 'Food', 'Concerts'], verified: true, gender: 'female', lastActive: '5min', smoking: 'never', drinking: 'socially', languages: ['English', 'Spanish'], degree: 'master', height: 168, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "A perfect first date for me is...", answer: "Morning run, brunch at a hidden gem, then a bookshop crawl" }, { question: "I'm looking for someone who...", answer: "Can keep up on a 10K and debate the best novels over dinner" }], mood: 'social', favoriteMusic: 'Pop', weekendActivity: 'Parkrun followed by brunch with friends', pets: 'dog', zodiac: 'Virgo' },
  { id: '6', name: '\u0633\u0627\u0631\u0627', age: 23, city: 'Teheran', country: '\u0627\u06CC\u0631\u0627\u0646', distance: 6, bio: '\u0637\u0631\u0627\u062D \u06AF\u0631\u0627\u0641\u06CC\u06A9 \u0648 \u0639\u0627\u0634\u0642 \u0647\u0646\u0631 \u0648 \u0645\u0648\u0633\u06CC\u0642\u06CC.', job: '\u0637\u0631\u0627\u062D \u06AF\u0631\u0627\u0641\u06CC\u06A9', education: '\u062F\u0627\u0646\u0634\u06AF\u0627\u0647 \u062A\u0647\u0631\u0627\u0646', photos: getPhotos('female', 3), interests: ['Art', 'Music', 'Photography', 'Coffee', 'Cinema'], verified: true, gender: 'female', lastActive: '10min', smoking: 'never', drinking: 'never', languages: ['Persian', 'English'], degree: 'bachelor', height: 163, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "My hidden talent is...", answer: "I can create stunning calligraphy art in under five minutes" }], mood: 'creative', favoriteMusic: 'Classical', weekendActivity: 'Painting and visiting art exhibitions', pets: 'cat', zodiac: 'Cancer' },
  { id: '7', name: '\u0623\u062D\u0645\u062F', age: 28, city: 'Dubai', country: '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A', distance: 15, bio: '\u0645\u0647\u0646\u062F\u0633 \u0628\u0631\u0645\u062C\u064A\u0627\u062A \u0648\u0631\u062D\u0627\u0644\u0629. \u0623\u0639\u0634\u0642 \u0627\u0644\u0637\u0628\u062E \u0648\u0627\u0644\u0631\u064A\u0627\u0636\u0629.', job: '\u0645\u0647\u0646\u062F\u0633 \u0628\u0631\u0645\u062C\u064A\u0627\u062A', education: '\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0644\u0643 \u0633\u0639\u0648\u062F', photos: getPhotos('male', 2), interests: ['Technology', 'Cooking', 'Fitness', 'Travel', 'Gaming'], verified: true, gender: 'male', lastActive: '20min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'English', 'French'], degree: 'master', height: 180, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The best trip I've ever taken...", answer: "Backpacking through Southeast Asia for three months" }, { question: "The way to my heart is...", answer: "A homemade meal and genuine conversation" }], mood: 'adventurous', favoriteMusic: 'Electronic', weekendActivity: 'Cooking new recipes and hitting the gym', pets: 'none', zodiac: 'Scorpio' },
  { id: '8', name: 'Giulia', age: 26, city: 'Roma', country: 'Italia', distance: 7, bio: 'Medico al Policlinico. Trattorie nascoste e jogging al Colosseo.', job: 'Medico', education: 'La Sapienza', photos: getPhotos('female', 4), interests: ['Running', 'Food', 'Travel', 'Reading', 'Dancing'], verified: true, gender: 'female', lastActive: '45min', smoking: 'never', drinking: 'socially', languages: ['Italian', 'English'], degree: 'doctorate', height: 172, children: 'want', religion: 'christian', relationship: 'serious', prompts: [{ question: "On Sundays you'll find me...", answer: "Jogging past the Colosseum then hunting for the best carbonara" }], mood: 'social', favoriteMusic: 'Jazz', weekendActivity: 'Running along the Tiber and exploring trattorias', pets: 'cat', zodiac: 'Aries' },
  { id: '9', name: 'Antoine', age: 31, city: 'Lyon', country: 'France', distance: 10, bio: 'Chef cuisinier. Nouvelles recettes et bons vins autour d\'une table.', job: 'Chef de cuisine', education: 'Institut Paul Bocuse', photos: getPhotos('male', 3), interests: ['Cooking', 'Wine', 'Hiking', 'Travel', 'Gardening'], verified: false, gender: 'male', lastActive: '1h', smoking: 'never', drinking: 'regularly', languages: ['French', 'English', 'Italian'], degree: 'bachelor', height: 176, children: 'want', religion: 'none', relationship: 'serious', prompts: [{ question: "My most controversial opinion is...", answer: "French cuisine is overrated unless you cook with real passion" }, { question: "Two truths and a lie...", answer: "I've cooked for a president, I hate chocolate, I own 200 cookbooks" }], mood: 'chill', favoriteMusic: 'Jazz', weekendActivity: 'Experimenting with new recipes and wine pairing', pets: 'none', zodiac: 'Taurus' },
  { id: '10', name: 'Hannah', age: 24, city: 'Hamburg', country: 'Deutschland', distance: 2, bio: 'Journalistin. Liebe Geschichten, Hunde und guten Kaffee.', job: 'Journalistin', education: 'Uni Hamburg', photos: getPhotos('female', 5), interests: ['Writing', 'Dogs', 'Coffee', 'Travel', 'Photography'], verified: true, gender: 'female', lastActive: '3min', smoking: 'never', drinking: 'sometimes', languages: ['Deutsch', 'English', 'Spanish'], degree: 'master', height: 167, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "I'm looking for someone who...", answer: "Loves deep conversations, good coffee, and spontaneous road trips" }], mood: 'creative', favoriteMusic: 'Indie Pop', weekendActivity: 'Writing in cafes with my dog beside me', pets: 'dog', zodiac: 'Gemini' },
  { id: '11', name: 'James', age: 30, city: 'London', country: 'United Kingdom', distance: 9, bio: 'Investment banker turning adventurer. Craft beers and Italian cooking.', job: 'VP at Goldman Sachs', education: 'Oxford University', photos: getPhotos('male', 4), interests: ['Travel', 'Cooking', 'Fitness', 'Wine', 'Skiing'], verified: true, gender: 'male', lastActive: '8min', smoking: 'never', drinking: 'socially', languages: ['English', 'French'], degree: 'master', height: 185, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "A perfect first date for me is...", answer: "Craft cocktails at a speakeasy, then cooking Italian together" }], mood: 'adventurous', favoriteMusic: 'Rock', weekendActivity: 'Training for my next ski trip or trying new restaurants', pets: 'none', zodiac: 'Leo' },
  { id: '12', name: 'Amira', age: 25, city: 'Tunis', country: '\u062A\u0648\u0646\u0633', distance: 5, bio: 'Ing\u00E9nieure en informatique. J\'adore la plage, la musique et les voyages.', job: 'Software Engineer', education: 'INSAT Tunis', photos: getPhotos('female', 6), interests: ['Technology', 'Beach', 'Music', 'Travel', 'Coffee'], verified: true, gender: 'female', lastActive: '12min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English'], degree: 'master', height: 164, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The way to my heart is...", answer: "Beach sunset, good music, and meaningful conversations" }, { question: "My hidden talent is...", answer: "I can solve a Rubik's cube in under two minutes" }], mood: 'chill', favoriteMusic: 'R&B', weekendActivity: 'Beach mornings and coding side projects', pets: 'cat', zodiac: 'Sagittarius' },
  { id: '13', name: 'Elena', age: 28, city: 'Firenze', country: 'Italia', distance: 6, bio: 'Storica dell\'arte. Tramonti e buona musica.', job: 'Curatrice agli Uffizi', education: 'Uni Firenze', photos: getPhotos('female', 7), interests: ['Art', 'Music', 'Wine', 'Theater', 'Travel'], verified: true, gender: 'female', lastActive: '12min', smoking: 'never', drinking: 'socially', languages: ['Italian', 'English', 'French'], degree: 'master', height: 169, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "The best trip I've ever taken...", answer: "A solo journey through Greek islands discovering ancient art" }], mood: 'romantic', favoriteMusic: 'Classical', weekendActivity: 'Gallery hopping and sunset wine on the terrace', pets: 'none', zodiac: 'Libra' },
  { id: '14', name: 'Youssef', age: 27, city: 'Mahdia', country: '\u062A\u0648\u0646\u0633', distance: 3, bio: 'M\u00E9decin passionn\u00E9 par le sport et la mer. Cherche quelqu\'un pour partager les couchers de soleil.', job: 'M\u00E9decin', education: 'Facult\u00E9 de M\u00E9decine de Monastir', photos: getPhotos('male', 5), interests: ['Fitness', 'Beach', 'Photography', 'Travel', 'Cooking'], verified: true, gender: 'male', lastActive: '5min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English', 'Deutsch'], degree: 'doctorate', height: 182, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "On Sundays you'll find me...", answer: "Morning swim in the sea, then grilling fish with the family" }, { question: "I'm looking for someone who...", answer: "Values family, loves the sea, and appreciates simple moments" }], mood: 'chill', favoriteMusic: 'Arabic Pop', weekendActivity: 'Swimming, beach football and sunset photography', pets: 'none', zodiac: 'Cancer' },
  { id: '15', name: 'Marie', age: 23, city: 'Z\u00FCrich', country: 'Schweiz', distance: 4, bio: 'Data Scientist. Snowboard im Winter, Wandern im Sommer.', job: 'Data Scientist bei Google', education: 'ETH Z\u00FCrich', photos: getPhotos('female', 8), interests: ['Technology', 'Skiing', 'Hiking', 'Coffee', 'Languages'], verified: true, gender: 'female', lastActive: '7min', smoking: 'never', drinking: 'sometimes', languages: ['Deutsch', 'French', 'English'], degree: 'master', height: 171, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "Two truths and a lie...", answer: "I've snowboarded in Japan, I speak four languages, I can't cook" }], mood: 'adventurous', favoriteMusic: 'Electronic', weekendActivity: 'Snowboarding in winter, trail running in summer', pets: 'none', zodiac: 'Capricorn' },
  { id: '16', name: 'Oliver', age: 32, city: 'Wien', country: '\u00D6sterreich', distance: 14, bio: 'Musiker und Produzent. Klavier seit ich 5 bin.', job: 'Musikproduzent', education: 'Uni f\u00FCr Musik Wien', photos: getPhotos('male', 6), interests: ['Music', 'Concerts', 'Coffee', 'Theater', 'Meditation'], verified: false, gender: 'male', lastActive: '1h', smoking: 'sometimes', drinking: 'socially', languages: ['Deutsch', 'English'], degree: 'bachelor', height: 179, children: 'none', religion: 'none', relationship: 'casual', prompts: [{ question: "My hidden talent is...", answer: "I can play any song by ear after hearing it once" }], mood: 'creative', favoriteMusic: 'Classical', weekendActivity: 'Composing music and exploring Viennese coffee houses', pets: 'cat', zodiac: 'Pisces' },
  { id: '17', name: 'Fatima', age: 26, city: 'Casablanca', country: '\u0627\u0644\u0645\u063A\u0631\u0628', distance: 8, bio: 'Avocate. Passionn\u00E9e par les droits humains et la lecture.', job: 'Avocate', education: 'Universit\u00E9 Hassan II', photos: getPhotos('female', 9), interests: ['Reading', 'Travel', 'Coffee', 'Volunteering', 'Languages'], verified: true, gender: 'female', lastActive: '20min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English', 'Spanish'], degree: 'master', height: 166, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "I'm looking for someone who...", answer: "Is passionate about making the world better and loves books" }, { question: "The way to my heart is...", answer: "Intellectual conversations over mint tea at sunset" }], mood: 'social', favoriteMusic: 'Andalusian', weekendActivity: 'Reading at a cafe and volunteering at the local shelter', pets: 'none', zodiac: 'Virgo' },
  { id: '18', name: 'Carlos', age: 29, city: 'Barcelona', country: 'Espa\u00F1a', distance: 11, bio: 'Arquitecto. Playa, tapas y buena compa\u00F1\u00EDa.', job: 'Arquitecto', education: 'UPC Barcelona', photos: getPhotos('male', 7), interests: ['Architecture', 'Beach', 'Food', 'Surfing', 'Travel'], verified: true, gender: 'male', lastActive: '15min', smoking: 'sometimes', drinking: 'socially', languages: ['Spanish', 'English', 'Catalan'], degree: 'master', height: 181, children: 'none', religion: 'none', relationship: 'casual', prompts: [{ question: "A perfect first date for me is...", answer: "Tapas crawl through the Gothic Quarter ending at the beach" }], mood: 'social', favoriteMusic: 'Latin', weekendActivity: 'Surfing at Barceloneta and sketching Gaudi buildings', pets: 'dog', zodiac: 'Sagittarius' },
  { id: '19', name: 'Aisha', age: 24, city: 'Beirut', country: '\u0644\u0628\u0646\u0627\u0646', distance: 9, bio: '\u0645\u0635\u0645\u0645\u0629 \u062F\u0627\u062E\u0644\u064A\u0629. \u0623\u062D\u0628 \u0627\u0644\u0641\u0646 \u0648\u0627\u0644\u0645\u0648\u0633\u064A\u0642\u0649 \u0648\u0627\u0644\u0637\u0628\u062E.', job: '\u0645\u0635\u0645\u0645\u0629 \u062F\u0627\u062E\u0644\u064A\u0629', education: '\u0627\u0644\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0641\u064A \u0628\u064A\u0631\u0648\u062A', photos: getPhotos('female', 10), interests: ['Art', 'Music', 'Cooking', 'Fashion', 'Travel'], verified: true, gender: 'female', lastActive: '8min', smoking: 'never', drinking: 'socially', languages: ['Arabic', 'English', 'French'], degree: 'bachelor', height: 162, children: 'none', religion: 'christian', relationship: 'serious', prompts: [{ question: "The way to my heart is...", answer: "Cooking a traditional Lebanese meal together with good music" }], mood: 'creative', favoriteMusic: 'Arabic Pop', weekendActivity: 'Antiquing and redesigning corners of my apartment', pets: 'cat', zodiac: 'Taurus' },
  { id: '20', name: 'Mehmet', age: 28, city: 'Istanbul', country: 'T\u00FCrkiye', distance: 7, bio: 'Gastronom ve gezgin. D\u00FCnyan\u0131n lezzetlerini ke\u015Ffediyorum.', job: 'Restaurant Owner', education: 'Bo\u011Fazi\u00E7i \u00DCniversitesi', photos: getPhotos('male', 8), interests: ['Cooking', 'Travel', 'Photography', 'Coffee', 'History'], verified: true, gender: 'male', lastActive: '30min', smoking: 'sometimes', drinking: 'socially', languages: ['Turkish', 'English', 'Arabic', 'Deutsch'], degree: 'bachelor', height: 177, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "My most controversial opinion is...", answer: "Turkish coffee is the only real coffee, everything else is flavored water" }, { question: "The best trip I've ever taken...", answer: "A food tour through Japan that changed how I cook forever" }], mood: 'adventurous', favoriteMusic: 'Turkish Folk', weekendActivity: 'Exploring bazaars and testing new recipes at the restaurant', pets: 'cat', zodiac: 'Aries' },
  { id: '21', name: 'Jessica', age: 27, city: 'New York', country: 'United States', distance: 20, bio: 'Art director at a creative agency. Broadway shows and rooftop cocktails.', job: 'Art Director', education: 'NYU', photos: getPhotos('female', 11), interests: ['Art', 'Theater', 'Fashion', 'Concerts', 'Yoga'], verified: true, gender: 'female', lastActive: '2min', smoking: 'never', drinking: 'socially', languages: ['English', 'Spanish'], degree: 'bachelor', height: 173, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "On Sundays you'll find me...", answer: "Gallery openings in Chelsea, then cocktails on a rooftop" }], mood: 'social', favoriteMusic: 'Hip-Hop', weekendActivity: 'Broadway matinees and rooftop brunch', pets: 'none', zodiac: 'Leo' },
  { id: '22', name: 'Rafael', age: 30, city: 'S\u00E3o Paulo', country: 'Brasil', distance: 25, bio: 'Engenheiro e surfista. Praia, m\u00FAsica ao vivo e a\u00E7a\u00ED.', job: 'Engenheiro Civil', education: 'USP', photos: getPhotos('male', 9), interests: ['Surfing', 'Music', 'Beach', 'Fitness', 'Travel'], verified: false, gender: 'male', lastActive: '40min', smoking: 'never', drinking: 'socially', languages: ['Portuguese', 'English', 'Spanish'], degree: 'bachelor', height: 184, children: 'none', religion: 'christian', relationship: 'casual', prompts: [{ question: "A perfect first date for me is...", answer: "Catching waves at sunrise, then acai bowls on the beach" }], mood: 'adventurous', favoriteMusic: 'Brazilian Pop', weekendActivity: 'Surfing and live samba music at the beach', pets: 'dog', zodiac: 'Aries' },
  { id: '23', name: 'Sakura', age: 25, city: 'Tokyo', country: '\u65E5\u672C', distance: 30, bio: 'UX designer. Love anime, ramen and cherry blossoms.', job: 'UX Designer at Sony', education: 'University of Tokyo', photos: getPhotos('female', 12), interests: ['Technology', 'Art', 'Food', 'Photography', 'Gaming'], verified: true, gender: 'female', lastActive: '15min', smoking: 'never', drinking: 'sometimes', languages: ['Japanese', 'English'], degree: 'master', height: 160, children: 'none', religion: 'buddhist', relationship: 'serious', prompts: [{ question: "My hidden talent is...", answer: "I can draw any anime character from memory perfectly" }, { question: "The way to my heart is...", answer: "A ramen crawl through hidden Tokyo alleyways" }], mood: 'creative', favoriteMusic: 'K-Pop', weekendActivity: 'Visiting manga cafes and photographing street fashion', pets: 'cat', zodiac: 'Gemini' },
  { id: '24', name: 'Omar', age: 26, city: 'Alger', country: '\u0627\u0644\u062C\u0632\u0627\u0626\u0631', distance: 6, bio: 'Architecte. Passionn\u00E9 par le patrimoine et les voyages.', job: 'Architecte', education: 'EPAU Alger', photos: getPhotos('male', 10), interests: ['Architecture', 'Travel', 'Photography', 'Mountains', 'History'], verified: true, gender: 'male', lastActive: '10min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English'], degree: 'master', height: 179, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The best trip I've ever taken...", answer: "Exploring the ancient Saharan cities and their incredible architecture" }], mood: 'adventurous', favoriteMusic: 'Rai', weekendActivity: 'Hiking in the Atlas Mountains and photographing old medinas', pets: 'none', zodiac: 'Scorpio' },
  { id: '25', name: 'Priya', age: 27, city: 'Mumbai', country: '\u0939\u093F\u0928\u094D\u0926\u0941\u0938\u094D\u0924\u0627\u0928', distance: 18, bio: 'Bollywood dance teacher and foodie. Life is a festival!', job: 'Dance Instructor', education: 'University of Mumbai', photos: getPhotos('female', 0), interests: ['Dancing', 'Food', 'Music', 'Festivals', 'Yoga'], verified: true, gender: 'female', lastActive: '5min', smoking: 'never', drinking: 'never', languages: ['Hindi', 'English', 'Marathi'], degree: 'bachelor', height: 161, children: 'none', religion: 'hindu', relationship: 'serious', prompts: [{ question: "Two truths and a lie...", answer: "I've performed on national TV, I hate Bollywood, I cook the best biryani" }, { question: "On Sundays you'll find me...", answer: "Teaching dance, eating street food, and celebrating life" }], mood: 'social', favoriteMusic: 'Bollywood', weekendActivity: 'Dance rehearsals and exploring Mumbai street food', pets: 'none', zodiac: 'Leo' },
  { id: '26', name: 'Nils', age: 31, city: 'Stockholm', country: 'Sverige', distance: 13, bio: 'Startup founder. Skiing, sauna, and strong coffee.', job: 'CEO at TechStart', education: 'KTH Stockholm', photos: getPhotos('male', 11), interests: ['Technology', 'Skiing', 'Coffee', 'Running', 'Cycling'], verified: true, gender: 'male', lastActive: '25min', smoking: 'never', drinking: 'socially', languages: ['Swedish', 'English', 'Deutsch'], degree: 'master', height: 188, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "I'm looking for someone who...", answer: "Can handle a sauna session and isn't afraid of the cold" }], mood: 'chill', favoriteMusic: 'Electronic', weekendActivity: 'Cross-country skiing and sauna sessions', pets: 'dog', zodiac: 'Aquarius' },
  { id: '27', name: 'Leila', age: 24, city: 'Sfax', country: '\u062A\u0648\u0646\u0633', distance: 4, bio: 'Pharmacienne. J\'aime la p\u00E2tisserie, la mer et les soir\u00E9es entre amis.', job: 'Pharmacienne', education: 'Facult\u00E9 de Pharmacie de Monastir', photos: getPhotos('female', 1), interests: ['Cooking', 'Beach', 'Reading', 'Music', 'Coffee'], verified: true, gender: 'female', lastActive: '18min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English'], degree: 'doctorate', height: 165, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The way to my heart is...", answer: "Homemade pastries, a walk by the sea, and genuine laughter" }], mood: 'romantic', favoriteMusic: 'French Pop', weekendActivity: 'Baking, beach walks and reading novels', pets: 'none', zodiac: 'Cancer' },
  { id: '28', name: 'Daniel', age: 29, city: 'Amsterdam', country: 'Nederland', distance: 8, bio: 'Photographer and cyclist. Canals, coffee shops and creativity.', job: 'Photographer', education: 'Amsterdam School of Arts', photos: getPhotos('male', 12), interests: ['Photography', 'Cycling', 'Art', 'Coffee', 'Travel'], verified: false, gender: 'male', lastActive: '35min', smoking: 'sometimes', drinking: 'socially', languages: ['Dutch', 'English', 'Deutsch'], degree: 'bachelor', height: 186, children: 'none', religion: 'none', relationship: 'casual', prompts: [{ question: "My most controversial opinion is...", answer: "Film photography will always be superior to digital" }, { question: "A perfect first date for me is...", answer: "Cycling to a hidden canal cafe and shooting photos along the way" }], mood: 'creative', favoriteMusic: 'Electronic', weekendActivity: 'Cycling through the city and shooting street photography', pets: 'none', zodiac: 'Gemini' },
  { id: '29', name: 'Mia', age: 22, city: 'K\u00F8benhavn', country: 'Danmark', distance: 10, bio: 'Architecture student. Hygge, design and sustainable living.', job: 'Architecture Student', education: 'DTU', photos: getPhotos('female', 2), interests: ['Architecture', 'Sustainability', 'Coffee', 'Cycling', 'Art'], verified: false, gender: 'female', lastActive: '6min', smoking: 'never', drinking: 'sometimes', languages: ['Danish', 'English', 'Deutsch'], degree: 'bachelor', height: 174, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "I'm looking for someone who...", answer: "Appreciates good design, cozy evenings, and sustainable living" }], mood: 'chill', favoriteMusic: 'Indie Pop', weekendActivity: 'Cycling to design museums and hygge evenings at home', pets: 'none', zodiac: 'Libra' },
  { id: '30', name: 'Karim', age: 26, city: 'Kairo', country: '\u0645\u0635\u0631', distance: 12, bio: '\u0645\u0647\u0646\u062F\u0633 \u0645\u0639\u0645\u0627\u0631\u064A. \u0623\u062D\u0628 \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u0633\u0641\u0631 \u0648\u0643\u0631\u0629 \u0627\u0644\u0642\u062F\u0645.', job: '\u0645\u0647\u0646\u062F\u0633 \u0645\u0639\u0645\u0627\u0631\u064A', education: '\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0642\u0627\u0647\u0631\u0629', photos: getPhotos('male', 13), interests: ['Architecture', 'History', 'Travel', 'Fitness', 'Photography'], verified: true, gender: 'male', lastActive: '15min', smoking: 'sometimes', drinking: 'never', languages: ['Arabic', 'English'], degree: 'bachelor', height: 181, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The best trip I've ever taken...", answer: "A Nile cruise discovering temples I'd only read about in textbooks" }], mood: 'adventurous', favoriteMusic: 'Arabic Pop', weekendActivity: 'Playing football and visiting historical sites', pets: 'none', zodiac: 'Scorpio' },
  { id: '31', name: 'Isabella', age: 25, city: 'Madrid', country: 'Espa\u00F1a', distance: 7, bio: 'Psic\u00F3loga. Me encanta bailar salsa y viajar.', job: 'Psic\u00F3loga', education: 'Universidad Complutense', photos: getPhotos('female', 3), interests: ['Dancing', 'Travel', 'Reading', 'Yoga', 'Music'], verified: true, gender: 'female', lastActive: '10min', smoking: 'never', drinking: 'socially', languages: ['Spanish', 'English', 'Portuguese'], degree: 'master', height: 167, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "On Sundays you'll find me...", answer: "Dancing salsa at a rooftop bar or reading in Retiro Park" }, { question: "My hidden talent is...", answer: "I can read body language like a book" }], mood: 'social', favoriteMusic: 'Latin', weekendActivity: 'Salsa dancing and tapas with friends', pets: 'cat', zodiac: 'Pisces' },
  { id: '32', name: 'Aydin', age: 30, city: 'Ankara', country: 'T\u00FCrkiye', distance: 9, bio: 'Akademisyen. Tarih, felsefe ve iyi bir \u00E7ay sohbeti.', job: 'Dozent', education: 'Hacettepe \u00DCniversitesi', photos: getPhotos('male', 14), interests: ['Reading', 'History', 'Coffee', 'Writing', 'Mountains'], verified: true, gender: 'male', lastActive: '1h', smoking: 'never', drinking: 'never', languages: ['Turkish', 'English', 'Arabic', 'Deutsch'], degree: 'doctorate', height: 175, children: 'want', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The way to my heart is...", answer: "A quiet evening with good tea, philosophy, and honest conversation" }], mood: 'chill', favoriteMusic: 'Classical', weekendActivity: 'Reading philosophy books and mountain hiking', pets: 'cat', zodiac: 'Virgo' },
  { id: '33', name: 'Sofia', age: 23, city: 'Lisboa', country: 'Portugal', distance: 14, bio: 'Musician and surfer. Fado, waves and pastel de nata.', job: 'Music Teacher', education: 'Universidade de Lisboa', photos: getPhotos('female', 4), interests: ['Music', 'Surfing', 'Beach', 'Food', 'Art'], verified: false, gender: 'female', lastActive: '22min', smoking: 'never', drinking: 'socially', languages: ['Portuguese', 'English', 'Spanish'], degree: 'bachelor', height: 170, children: 'none', religion: 'none', relationship: 'casual', prompts: [{ question: "A perfect first date for me is...", answer: "Live fado music, port wine and a walk through Alfama at night" }], mood: 'romantic', favoriteMusic: 'Fado', weekendActivity: 'Surfing in the morning, playing guitar at sunset', pets: 'dog', zodiac: 'Sagittarius' },
  { id: '34', name: 'Ali', age: 25, city: 'Sousse', country: '\u062A\u0648\u0646\u0633', distance: 5, bio: 'Entrepreneur et sportif. Football, plage et projets ambitieux.', job: 'Entrepreneur', education: 'ISG Sousse', photos: getPhotos('male', 15), interests: ['Fitness', 'Beach', 'Technology', 'Travel', 'Cooking'], verified: true, gender: 'male', lastActive: '8min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English', 'Deutsch'], degree: 'master', height: 178, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "Two truths and a lie...", answer: "I started my first business at 19, I hate the beach, I speak four languages" }, { question: "I'm looking for someone who...", answer: "Is ambitious, loves the sea, and values family" }], mood: 'adventurous', favoriteMusic: 'Hip-Hop', weekendActivity: 'Beach football and brainstorming new business ideas', pets: 'none', zodiac: 'Aries' },
  { id: '35', name: 'Anna', age: 26, city: 'Warszawa', country: 'Polska', distance: 11, bio: 'Graphic designer. Museums, concerts and craft beer.', job: 'Graphic Designer', education: 'Warsaw School of Arts', photos: getPhotos('female', 5), interests: ['Art', 'Concerts', 'Coffee', 'Photography', 'Cycling'], verified: true, gender: 'female', lastActive: '4min', smoking: 'never', drinking: 'socially', languages: ['Polish', 'English', 'Deutsch'], degree: 'bachelor', height: 172, children: 'none', religion: 'christian', relationship: 'undecided', prompts: [{ question: "My hidden talent is...", answer: "I can sketch a portrait in under three minutes" }], mood: 'creative', favoriteMusic: 'Indie Rock', weekendActivity: 'Museum visits and craft beer tastings', pets: 'cat', zodiac: 'Aquarius' },
  { id: '36', name: 'David', age: 33, city: 'Sydney', country: 'Australia', distance: 35, bio: 'Marine biologist. Ocean lover, scuba diver, sunset chaser.', job: 'Marine Biologist', education: 'UNSW', photos: getPhotos('male', 16), interests: ['Surfing', 'Beach', 'Photography', 'Travel', 'Sustainability'], verified: true, gender: 'male', lastActive: '2h', smoking: 'never', drinking: 'socially', languages: ['English'], degree: 'doctorate', height: 183, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "The best trip I've ever taken...", answer: "Diving the Great Barrier Reef and swimming with whale sharks" }, { question: "My most controversial opinion is...", answer: "Surfing at sunrise beats any gym workout ever invented" }], mood: 'adventurous', favoriteMusic: 'Rock', weekendActivity: 'Scuba diving and beach cleanups', pets: 'dog', zodiac: 'Taurus' },
  { id: '37', name: 'Hana', age: 24, city: 'Marrakech', country: '\u0627\u0644\u0645\u063A\u0631\u0628', distance: 8, bio: 'Designer de bijoux. Art, voyages et th\u00E9 \u00E0 la menthe.', job: 'Designer de bijoux', education: 'ESAV Marrakech', photos: getPhotos('female', 6), interests: ['Fashion', 'Art', 'Travel', 'Coffee', 'Photography'], verified: false, gender: 'female', lastActive: '30min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English'], degree: 'bachelor', height: 163, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "The way to my heart is...", answer: "Mint tea in a riad courtyard and handmade gifts" }], mood: 'creative', favoriteMusic: 'Andalusian', weekendActivity: 'Designing jewelry and exploring the souks', pets: 'none', zodiac: 'Cancer' },
  { id: '38', name: 'Marcus', age: 28, city: 'Chicago', country: 'United States', distance: 22, bio: 'Jazz musician and teacher. Deep dish pizza enthusiast.', job: 'Music Teacher', education: 'DePaul University', photos: getPhotos('male', 17), interests: ['Music', 'Food', 'Concerts', 'Running', 'Coffee'], verified: true, gender: 'male', lastActive: '45min', smoking: 'never', drinking: 'socially', languages: ['English', 'French'], degree: 'master', height: 180, children: 'none', religion: 'christian', relationship: 'serious', prompts: [{ question: "On Sundays you'll find me...", answer: "Playing sax at a jazz club or hunting for the best deep dish" }, { question: "My hidden talent is...", answer: "I can play seven different instruments" }], mood: 'chill', favoriteMusic: 'Jazz', weekendActivity: 'Jamming at jazz clubs and exploring food trucks', pets: 'none', zodiac: 'Pisces' },
  { id: '39', name: 'Lin', age: 25, city: 'Seoul', country: '\uD55C\uAD6D', distance: 28, bio: 'K-beauty expert and foodie. Let\'s explore street markets!', job: 'Beauty Brand Manager', education: 'Yonsei University', photos: getPhotos('female', 7), interests: ['Fashion', 'Food', 'Concerts', 'Photography', 'Skincare'], verified: true, gender: 'female', lastActive: '11min', smoking: 'never', drinking: 'sometimes', languages: ['Korean', 'English', 'Japanese'], degree: 'bachelor', height: 163, children: 'none', religion: 'none', relationship: 'undecided', prompts: [{ question: "A perfect first date for me is...", answer: "Street food tour through Myeongdong ending at a karaoke bar" }], mood: 'social', favoriteMusic: 'K-Pop', weekendActivity: 'Exploring street markets and trying new skincare routines', pets: 'other', zodiac: 'Gemini' },
  { id: '40', name: 'Jakob', age: 27, city: 'Bern', country: 'Schweiz', distance: 6, bio: 'Umweltingenieur. Berge, K\u00E4se und lange Gespr\u00E4che.', job: 'Umweltingenieur', education: 'Uni Bern', photos: getPhotos('male', 18), interests: ['Hiking', 'Sustainability', 'Skiing', 'Coffee', 'Cooking'], verified: true, gender: 'male', lastActive: '9min', smoking: 'never', drinking: 'sometimes', languages: ['Deutsch', 'French', 'English'], degree: 'master', height: 182, children: 'want', religion: 'none', relationship: 'serious', prompts: [{ question: "I'm looking for someone who...", answer: "Enjoys mountain hikes, fondue nights, and meaningful conversations" }], mood: 'chill', favoriteMusic: 'Folk', weekendActivity: 'Mountain hiking and cooking cheese fondue', pets: 'dog', zodiac: 'Taurus' },
  { id: '41', name: 'Nour', age: 23, city: 'Riad', country: '\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629', distance: 10, bio: '\u0645\u0647\u0646\u062F\u0633\u0629 \u0628\u0631\u0645\u062C\u064A\u0627\u062A. \u0623\u062D\u0628 \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627.', job: '\u0645\u0647\u0646\u062F\u0633\u0629 \u0628\u0631\u0645\u062C\u064A\u0627\u062A', education: '\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F', photos: getPhotos('female', 8), interests: ['Technology', 'Reading', 'Coffee', 'Travel', 'Art'], verified: true, gender: 'female', lastActive: '7min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'English'], degree: 'bachelor', height: 160, children: 'none', religion: 'muslim', relationship: 'serious', prompts: [{ question: "My hidden talent is...", answer: "I can build a full app prototype in a single weekend" }, { question: "The way to my heart is...", answer: "Thoughtful conversations about technology and the future" }], mood: 'creative', favoriteMusic: 'Pop', weekendActivity: 'Reading sci-fi novels and working on side projects', pets: 'cat', zodiac: 'Capricorn' },
  { id: '42', name: 'Lucas', age: 26, city: 'Buenos Aires', country: 'Argentina', distance: 30, bio: 'Filmmaker. Tango, asado y cine independiente.', job: 'Film Director', education: 'UBA', photos: getPhotos('male', 19), interests: ['Cinema', 'Dancing', 'Food', 'Music', 'Photography'], verified: false, gender: 'male', lastActive: '1h', smoking: 'sometimes', drinking: 'socially', languages: ['Spanish', 'English', 'Italian'], degree: 'bachelor', height: 176, children: 'none', religion: 'none', relationship: 'casual', prompts: [{ question: "The best trip I've ever taken...", answer: "A road trip through Patagonia filming landscapes and local stories" }], mood: 'romantic', favoriteMusic: 'Tango', weekendActivity: 'Watching indie films and dancing tango at milongas', pets: 'none', zodiac: 'Scorpio' },
  { id: '43', name: 'Zara', age: 28, city: 'Cape Town', country: 'South Africa', distance: 35, bio: 'Wildlife photographer. Ocean, mountains and golden sunsets.', job: 'Wildlife Photographer', education: 'UCT', photos: getPhotos('female', 9), interests: ['Photography', 'Travel', 'Beach', 'Mountains', 'Sustainability'], verified: true, gender: 'female', lastActive: '20min', smoking: 'never', drinking: 'socially', languages: ['English', 'Afrikaans'], degree: 'bachelor', height: 170, children: 'none', religion: 'none', relationship: 'serious', prompts: [{ question: "My most controversial opinion is...", answer: "Sunrise is overrated, the best wildlife shots happen at dusk" }, { question: "On Sundays you'll find me...", answer: "Hiking Table Mountain or photographing penguins at Boulders Beach" }], mood: 'adventurous', favoriteMusic: 'Afrobeats', weekendActivity: 'Safari photography trips and ocean swimming', pets: 'dog', zodiac: 'Sagittarius' },
  { id: '44', name: 'Amine', age: 29, city: 'Rabat', country: '\u0627\u0644\u0645\u063A\u0631\u0628', distance: 7, bio: 'Professeur de math\u00E9matiques. \u00C9checs, randonn\u00E9e et th\u00E9 \u00E0 la menthe.', job: 'Professeur', education: 'Universit\u00E9 Mohammed V', photos: getPhotos('male', 20), interests: ['Reading', 'Hiking', 'Coffee', 'Music', 'Travel'], verified: true, gender: 'male', lastActive: '14min', smoking: 'never', drinking: 'never', languages: ['Arabic', 'French', 'English'], degree: 'master', height: 175, children: 'want', religion: 'muslim', relationship: 'serious', prompts: [{ question: "A perfect first date for me is...", answer: "A chess game over mint tea followed by a walk in the old medina" }], mood: 'chill', favoriteMusic: 'Gnawa', weekendActivity: 'Hiking, playing chess, and reading over mint tea', pets: 'none', zodiac: 'Virgo' },
];

export const currentUser: Profile = {
  id: 'current',
  name: 'Alex',
  age: 27,
  city: 'Berlin',
  country: 'Deutschland',
  distance: 0,
  bio: 'Love exploring the city, trying new restaurants, and weekend getaways. Let\u2019s grab a coffee!',
  job: 'Product Designer',
  education: 'Universit\u00E4t der K\u00FCnste Berlin',
  photos: [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&h=800&fit=crop',
  ],
  interests: ['Design', 'Coffee', 'Travel', 'Photography', 'Music'],
  verified: true,
  gender: 'male',
  lastActive: 'now',
  smoking: 'never',
  drinking: 'socially',
  languages: ['Deutsch', 'English', 'French'],
  degree: 'master',
  height: 180,
  children: 'none',
  religion: 'none',
  relationship: 'serious',
  prompts: [{ question: "The way to my heart is...", answer: "Good coffee, spontaneous adventures and deep conversations" }],
  mood: 'adventurous',
  favoriteMusic: 'Alternative',
  weekendActivity: 'Exploring new cafes and neighborhoods',
  pets: 'none',
  zodiac: 'Leo',
};

export const initialMatches: Match[] = [
  {
    profile: mockProfiles[0], // Sophie
    matchedAt: '2h ago',
    messages: [
      { id: 'm1', senderId: '1', text: 'Hey! Dein Profil gef\u00E4llt mir \u2764\uFE0F', timestamp: '14:30' },
      { id: 'm2', senderId: 'current', text: 'Danke! Deins auch! Bist du Architektin?', timestamp: '14:35' },
      { id: 'm3', senderId: '1', text: 'Ja genau! Ich liebe nachhaltiges Design. Was machst du so?', timestamp: '14:40' },
    ],
  },
  {
    profile: mockProfiles[4], // Emily
    matchedAt: '5h ago',
    messages: [
      { id: 'm4', senderId: '5', text: 'Hi there! Love your taste in music!', timestamp: '11:20' },
      { id: 'm5', senderId: 'current', text: 'Thanks! What kind of music are you into?', timestamp: '11:25' },
    ],
  },
  {
    profile: mockProfiles[2], // Camille
    matchedAt: '1d ago',
    messages: [],
  },
  {
    profile: mockProfiles[7], // Giulia
    matchedAt: '2d ago',
    messages: [
      { id: 'm6', senderId: '8', text: 'Ciao! Come stai?', timestamp: 'Yesterday' },
    ],
  },
];
