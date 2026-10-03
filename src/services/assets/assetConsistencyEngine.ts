import { ProjectArtDirection } from '../../types/assets';

export const DEFAULT_EMBERVALE_ART_DIRECTION: ProjectArtDirection = {
  visualStyle: 'Semi-stylized Anime 3D / Studio Ghibli meets Genshin Impact with vibrant cel-shading and PBR hand-painted accents',
  colorPalette: [
    { name: 'Rift Azure', hex: '#38bdf8', role: 'Elemental magic energy & sky vistas' },
    { name: 'Ember Coral', hex: '#f97316', role: 'Wild creatures & flame elemental surges' },
    { name: 'Ancient Moss', hex: '#10b981', role: 'Meadowlands & overgrown stone ruins' },
    { name: 'Void Obsidian', hex: '#1e1b4b', role: 'Rift portals & corruption zones' },
    { name: 'Sunlit Gold', hex: '#fbbf24', role: 'UI highlights & mastery trophies' },
  ],
  lightingMood: 'Warm golden-hour ambient with saturated chromatic sky light and ethereal blue subsurface scattering on elemental crystals',
  materialsPbr: 'Mobile-forward PBR: Albedo with baked cavity occlusion, Roughness (0.3-0.8), subtle Metalness (0.0-0.2 for creatures, 0.9 for weapons), and 16-bit Tangent Normal maps',
  characterProportions: '7-heads heroic stylized proportions, expressive oversized anime eyes, crisp silhouette lines readable on 6-inch mobile screens',
  creatureDesignLanguage: 'Organic elemental anatomy, expressive facial features, recognizable silhouettes, distinct color gradients signaling elemental affinity (e.g. Electric = yellow/cyan lightning crests)',
  environmentStyle: 'Stylized low-friction terrain with modular mossy rock formations, wind-swayed tall grass with vertex color waving, crystalline rift spires',
  uiStyle: 'Clean dark slate glassmorphism with neon elemental accent borders, 44px minimum touch targets, monospace and modern sans-serif typography',
  vfxStyle: 'High-contrast particle bursts with custom noise turbulence, cartoon impact stars, swirling ribbon trails, zero screen-filling smoke on mobile',
  cameraStyle: 'Over-the-shoulder 3rd person follow camera, 65-degree vertical FOV, dynamic combat camera pullback to 85-degree FOV on ultimate abilities',
  animationStyle: 'Snappy keyframe posing with 2-frame anticipation, exaggerated follow-through on creature tails/ears, responsive 0.1s transition blending',
  assetQualityTarget: 'Stylized PBR',
  platformOptimizationTarget: 'Mobile (Godot Forward+ / Mobile Vulkan)',
};

export class AssetConsistencyEngine {
  /**
   * Section 20: Asset Consistency Engine
   * Enriches raw user generation prompt with strictly relevant art direction guidelines
   * without dumping unrelated bulk text.
   */
  enrichPromptWithArtDirection(
    userPrompt: string,
    assetType: string,
    artDirection: ProjectArtDirection = DEFAULT_EMBERVALE_ART_DIRECTION,
    referenceNames: string[] = []
  ): {
    enrichedPrompt: string;
    styleContextApplied: string[];
    suggestedNegativePrompt: string;
  } {
    const styleContextApplied: string[] = [];

    // Core aesthetic token
    let promptPrefix = `[Art Style: ${artDirection.visualStyle}]. `;
    styleContextApplied.push('Art Style conditioning');

    // Palette token
    const paletteTokens = artDirection.colorPalette.slice(0, 3).map((c) => `${c.name} (${c.hex})`).join(', ');
    promptPrefix += `[Color Scheme: Harmonize with ${paletteTokens}]. `;
    styleContextApplied.push('Color Palette harmony');

    // Category-specific conditioning
    if (['CREATURE', 'CHARACTER', 'NPC'].includes(assetType)) {
      promptPrefix += `[Design Language: ${artDirection.creatureDesignLanguage}; Silhouette: readable mobile outline]. `;
      styleContextApplied.push('Creature/Character design silhouette');
    } else if (['ENVIRONMENT', 'PROP', 'BUILDING'].includes(assetType)) {
      promptPrefix += `[Environment: ${artDirection.environmentStyle}; Lighting: ${artDirection.lightingMood}]. `;
      styleContextApplied.push('Environment & Lighting mood');
    } else if (['UI', 'ICON', 'UI_ASSET'].includes(assetType)) {
      promptPrefix += `[UI Style: ${artDirection.uiStyle}]. `;
      styleContextApplied.push('UI Design language');
    } else if (assetType === 'VFX') {
      promptPrefix += `[VFX: ${artDirection.vfxStyle}]. `;
      styleContextApplied.push('VFX Particle rules');
    }

    if (referenceNames.length > 0) {
      promptPrefix += `[Visual References: Visually aligned with ${referenceNames.join(', ')}]. `;
      styleContextApplied.push(`Reference alignment (${referenceNames.length} assets)`);
    }

    const enrichedPrompt = `${promptPrefix}Subject: ${userPrompt.trim()}. Output: Game-ready high quality asset, clean edges, mobile optimized.`;

    const suggestedNegativePrompt =
      'photorealistic noise, muddy colors, harsh unstylized specular, photoreal humans, deformed limbs, floating artifacts, out of frame, blurry, low resolution, watermark, amateur text';

    return {
      enrichedPrompt,
      styleContextApplied,
      suggestedNegativePrompt,
    };
  }
}

export const assetConsistencyEngine = new AssetConsistencyEngine();
