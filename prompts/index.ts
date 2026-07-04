export const destinationRecommendationPrompt = (context: {
  catalogJson: string;
  preferencesJson: string;
}) => `
You are an expert AI travel curator for India and nearby regions. Use ONLY destinations from the catalog when possible; you may combine catalog entries with accurate regional knowledge.

Traveler preferences (JSON):
${context.preferencesJson}

Destination catalog from database (JSON):
${context.catalogJson}

Return a single JSON object matching this exact shape (no markdown, no prose outside JSON):
{
  "summary": "2-3 sentence overview of the trip plan",
  "destinations": [
    {
      "id": "catalog id if known",
      "name": "string",
      "state": "string",
      "country": "string",
      "whyItMatches": "personalized paragraph",
      "estimatedBudgetInr": number,
      "suggestedDurationDays": number,
      "highlights": ["string"],
      "attractions": [
        {
          "id": "optional",
          "name": "string",
          "description": "string",
          "category": "string",
          "hiddenGem": false,
          "whyItMatches": "string"
        }
      ],
      "hiddenGems": [
        {
          "name": "string",
          "description": "string",
          "category": "string",
          "hiddenGem": true,
          "whyItMatches": "string"
        }
      ]
    }
  ]
}

Rules:
- Return 1-3 destinations that fit travelDays and budget.
- Prefer non-obvious attractions in hiddenGems.
- estimatedBudgetInr is total trip estimate in Indian Rupees for the group size implied (solo traveler).
- Always valid JSON.
`.trim();

export const hiddenGemsEnrichmentPrompt = (context: {
  travelerJson: string;
  candidatesJson: string;
  destinationName: string;
}) => `
You enrich semantic search results into personalized hidden gem recommendations.

Destination: ${context.destinationName}
Traveler profile: ${context.travelerJson}
Candidate places (from vector search): ${context.candidatesJson}

Return JSON only:
{
  "destinationName": "${context.destinationName}",
  "curatorNote": "short witty curator intro",
  "gems": [
    {
      "id": "from candidate",
      "name": "string",
      "description": "refined description avoiding clichés",
      "category": "string",
      "personalizedReason": "why THIS traveler will love it",
      "similarityScore": optional number 0-1
    }
  ]
}

Exclude famous overcrowded landmarks. Emphasize discovery and authenticity.
`.trim();

export const storyGenerationPrompt = (context: {
  attractionName: string;
  destinationName: string;
  style: string;
  attractionContext: string;
}) => `
Write an immersive travel story for narration.

Place: ${context.attractionName}, ${context.destinationName}
Style: ${context.style}
Context: ${context.attractionContext}

Return JSON only:
{
  "title": "evocative title",
  "style": "${context.style}",
  "wordCount": number,
  "story": "200-400 words, emotionally rich, narration-ready",
  "narrationTips": ["tip for voice delivery"]
}

Match the ${context.style} tone precisely. Use vivid sensory detail. No markdown in story field.
`.trim();

export const eventRecommendationPrompt = (context: {
  destinationName: string;
  travelerJson: string;
  eventsJson: string;
}) => `
Recommend cultural events and local experiences.

Destination: ${context.destinationName}
Traveler: ${context.travelerJson}
Available events (seed data): ${context.eventsJson}

Return JSON:
{
  "destinationName": "${context.destinationName}",
  "events": [
    {
      "id": "from seed",
      "title": "string",
      "description": "string",
      "category": "festival|workshop|food|art|performance",
      "eventDate": "ISO date string",
      "whyItSuitsTraveler": "personalized explanation"
    }
  ]
}

Pick 3-6 events. Explain why each suits the traveler.
`.trim();

export const hostMatchmakingPrompt = (context: {
  destinationName: string;
  travelerJson: string;
  hostsJson: string;
}) => `
Match travelers with local hosts for authentic experiences.

Destination: ${context.destinationName}
Traveler: ${context.travelerJson}
Local hosts: ${context.hostsJson}

Return JSON:
{
  "destinationName": "${context.destinationName}",
  "hosts": [
    {
      "id": "from seed",
      "name": "string",
      "profession": "string",
      "specialties": ["string"],
      "personalizedExplanation": "warm, specific match reason"
    }
  ]
}

Return 2-4 best matches ordered by relevance.
`.trim();
