'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseApi, spotsApi } from '@/lib/api'
import { ParseResult, SpotCategory, SourceType, SpotParseItem } from '@/lib/types'
import Button from '@/components/ui/Button'
import ParsePreview from '@/components/ParsePreview'
import MultiSpotPreview from '@/components/MultiSpotPreview'

type Step = 'input' | 'parsing' | 'preview' | 'multi' | 'manual'

const PARSE_MESSAGES = [
  'Reading the page…',
  'Extracting location details…',
  'AI is filling in the blanks…',
  'Almost there…',
]

const SOURCE_ICONS: Partial<Record<string, string>> = {
  instagram: '📸', tiktok: '🎵', youtube: '▶️',
  maps: '🗺', google: '🗺', tripadvisor: '🌟',
}

function getSourceIcon(url: string) {
  const lower = url.toLowerCase()
  for (const [key, icon] of Object.entries(SOURCE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '🔗'
}

function ParsingScreen({ url }: { url: string }) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => Math.min(i + 1, PARSE_MESSAGES.length - 1)), 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center px-6 pb-16">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Animated orb */}
        <div className="relative mb-10">
          <div className="w-24 h-24 rounded-full btn-primary-gradient flex items-center justify-center shadow-2xl pulse-glow">
            <span className="text-4xl">✨</span>
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-3 rounded-full border border-primary/10 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
        </div>

        <h2 className="font-headline text-2xl font-black text-on-surface mb-2 text-center">
          Curating your spot
        </h2>
        <p className="text-sm text-on-surface-variant text-center mb-8 min-h-[20px] transition-all duration-500">
          {PARSE_MESSAGES[msgIdx]}
        </p>

        {/* URL chip */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm text-sm text-on-surface-variant max-w-full overflow-hidden">
          <span className="shrink-0">{getSourceIcon(url)}</span>
          <span className="truncate text-xs">{url}</span>
        </div>

        {/* Dot bounce loader */}
        <div className="flex gap-2 mt-10">
          <div className="w-2 h-2 rounded-full bg-primary dot-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary dot-bounce dot-bounce-2" />
          <div className="w-2 h-2 rounded-full bg-primary dot-bounce dot-bounce-3" />
        </div>
      </div>
    </div>
  )
}

export default function NewSpotPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)

  async function handleParse() {
    if (!url.trim()) return
    setParseError(null)
    setStep('parsing')
    try {
      const result = await parseApi.parseUrl(url.trim())
      setParseResult(result)
      // If AI found multiple spots, go to multi-select screen
      setStep(result.spots && result.spots.length > 1 ? 'multi' : 'preview')
    } catch {
      setParseError('Could not parse this URL. You can fill in the details manually.')
      setStep('manual')
    }
  }

  async function handleSave(data: {
    name: string; address?: string; city?: string; category: SpotCategory
    coverImageUrl?: string; description?: string; tags: string[]
    originalUrl: string; sourceType: SourceType
  }) {
    await spotsApi.create({
      name: data.name, address: data.address, city: data.city,
      category: data.category, coverImageUrl: data.coverImageUrl,
      description: data.description,
      tags: data.tags, originalUrl: data.originalUrl,
      sourceType: data.sourceType, isPublic: false,
    })
    router.push('/feed')
  }

  async function handleSaveMulti(selected: SpotParseItem[]) {
    await Promise.all(selected.map(s =>
      spotsApi.create({
        name: s.name, address: s.address, city: s.city,
        category: s.category, coverImageUrl: s.coverImageUrl,
        description: s.description, tags: s.suggestedTags,
        originalUrl: parseResult?.originalUrl ?? url,
        sourceType: parseResult?.sourceType ?? 'AI_PARSED',
        isPublic: false,
      })
    ))
    router.push('/feed')
  }

  if (step === 'parsing') {
    return <ParsingScreen url={url} />
  }

  if (step === 'multi' && parseResult) {
    return (
      <div className="min-h-screen bg-[#f0f0f0]">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <button onClick={() => setStep('input')} className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 font-medium">
            ← Back
          </button>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 fade-in-up">
            <div className="w-10 h-10 rounded-full btn-primary-gradient flex items-center justify-center shadow-md shrink-0">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h1 className="font-headline text-xl font-black text-on-surface leading-tight">Multiple spots found!</h1>
              <p className="text-xs text-on-surface-variant">Select which ones you want to save</p>
            </div>
          </div>
          <MultiSpotPreview
            spots={parseResult.spots}
            originalUrl={parseResult.originalUrl}
            onSave={handleSaveMulti}
            onCancel={() => setStep('input')}
          />
        </div>
      </div>
    )
  }

  if (step === 'preview' && parseResult) {
    return (
      <div className="min-h-screen bg-[#f0f0f0]">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <button onClick={() => setStep('input')} className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 font-medium">
            ← Back
          </button>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Success header */}
          <div className="flex items-center gap-3 mb-6 fade-in-up">
            <div className="w-10 h-10 rounded-full btn-primary-gradient flex items-center justify-center shadow-md shrink-0">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h1 className="font-headline text-xl font-black text-on-surface leading-tight">Spot found!</h1>
              <p className="text-xs text-on-surface-variant">
                {parseResult.sourceType === 'AI_PARSED' ? 'Filled in by AI — review and save' : 'Check the details below'}
              </p>
            </div>
          </div>
          <ParsePreview result={parseResult} onSave={handleSave} onCancel={() => setStep('input')} />
        </div>
      </div>
    )
  }

  if (step === 'manual') {
    const empty: ParseResult = {
      name: '', address: '', city: '', category: 'OTHER',
      coverImageUrl: undefined, suggestedTags: [], sourceType: 'MANUAL',
      originalUrl: url, fromCache: false, spots: [],
    }
    return (
      <div className="min-h-screen bg-[#f0f0f0]">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <button onClick={() => setStep('input')} className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 font-medium">
            ← Back
          </button>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-1">Add Manually</h1>
          {parseError && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-5 text-sm text-amber-700">
              <span>⚠️</span>
              <span>{parseError}</span>
            </div>
          )}
          <ParsePreview result={empty} onSave={handleSave} onCancel={() => setStep('input')} />
        </div>
      </div>
    )
  }

  // Step 1: URL input
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <button onClick={() => router.back()} className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 font-medium">
          ← Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">

          {/* Hero */}
          <div className="flex justify-center mb-8 fade-in-up">
            <div className="relative">
              <div className="w-20 h-20 rounded-full btn-primary-gradient flex items-center justify-center shadow-xl">
                <span className="text-3xl">✨</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-sm">
                🔗
              </div>
            </div>
          </div>

          <h1 className="font-headline text-3xl font-black text-on-surface mb-2 text-center fade-in-up fade-in-up-delay-1">
            Add a Spot
          </h1>
          <p className="text-sm text-on-surface-variant text-center mb-8 leading-relaxed fade-in-up fade-in-up-delay-2">
            Paste any link — Instagram, Google Maps,<br />TikTok, anywhere you love.
          </p>

          {/* Source type chips */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap fade-in-up fade-in-up-delay-2">
            {['📸 Instagram', '🗺 Google Maps', '🎵 TikTok', '🌐 Any URL'].map(label => (
              <span key={label} className="text-xs px-3 py-1 rounded-full bg-white shadow-sm text-on-surface-variant font-medium">
                {label}
              </span>
            ))}
          </div>

          {/* Input card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-5 space-y-3 fade-in-up fade-in-up-delay-3">
            <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary transition-all">
              <span className="text-lg shrink-0">🔗</span>
              <input
                type="url"
                placeholder="Paste a link here…"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleParse()}
                autoFocus
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
              {url && (
                <button onClick={() => setUrl('')} className="text-on-surface-variant/60 hover:text-on-surface-variant text-lg leading-none">
                  ×
                </button>
              )}
            </div>

            <button
              onClick={handleParse}
              disabled={!url.trim()}
              className="w-full h-12 rounded-xl btn-primary-gradient text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>✨</span>
              <span>Parse with AI</span>
            </button>
          </div>

          <button
            type="button"
            className="w-full mt-4 text-sm text-on-surface-variant hover:text-on-surface text-center py-2"
            onClick={() => setStep('manual')}
          >
            Add without a link →
          </button>
        </div>
      </div>
    </div>
  )
}
