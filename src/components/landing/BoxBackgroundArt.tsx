import React from 'react';

/**
 * 1. Stripe Startups Programme Silk Wave
 * Direct asset from stripe.com/index.html: card_startups.png
 * Vibrant fuchsia/magenta silk wave with silky, unnoticeable feathered fade into white.
 */
export function StripeStartupsWaveArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none overflow-hidden select-none">
      <img
        src="https://images.stripeassets.com/fzn2n1nzq965/1DZkp4Ce0kiwj2F2Z0kJ16/fcb4904fd728f49521385059618245b9/card_startups.png?w=1169&fm=webp&q=90"
        alt=""
        className="w-full h-full object-cover object-left"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
        }}
      />
    </div>
  );
}

/**
 * 2. Stripe Atlas 3D Origami Prism
 * Exact vector SVG extraction from stripe.com/index.html: startups__atlas-graphic
 * Geometric 3D origami diamond with official Atlas amber, gold, and orange gradients.
 */
export function StripeAtlasPrismArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[44%] pointer-events-none overflow-hidden select-none flex items-center justify-end">
      <div className="relative w-full h-[130%] flex items-center justify-end -mr-2">
        <svg
          viewBox="0 0 40 40"
          className="w-auto h-[125%] max-h-[260px] object-contain drop-shadow-[0_8px_20px_rgba(251,191,36,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M19.9952 1c.9747 0 1.8657.5513 2.3006 1.42365l7.9975 15.99495 8.425 16.8558c.3991.7977.3569 1.7452-.1118 2.5041-.3437.5566-.8808.9537-1.4945 1.126l-.1692.0412c-.114.0238-.2301.04-.3478.0481L36.4176 39l-16.4224-3.2655L9.69702 18.4186 17.6945 2.42365C18.1295 1.5513 19.0204 1 19.9952 1"
            fill="#fb0"
          />
          <path
            d="M19.9952 1c.9748 0 1.8657.5513 2.3007 1.42365l7.9975 15.99495-10.2982 17.3159L3.5728 39c-.892 0-1.72022-.4625-2.1889-1.2215-.468672-.7589-.510968-1.7064-.11178-2.5041l8.42495-16.8558L17.6945 2.42365C18.1295 1.5513 19.0204 1 19.9952 1"
            fill="url(#atlas-grad-a)"
          />
          <path
            d="M19.9952 1c.9747 0 1.8657.5513 2.3006 1.42365l7.9975 15.99495-10.2981 17.3159L9.69702 18.4186 17.6945 2.42365c.4078-.81782 1.2163-1.35348 2.119-1.41725z"
            fill="url(#atlas-grad-b)"
          />
          <defs>
            <linearGradient id="atlas-grad-a" x1="15.6303" y1="18.2379" x2="15.545" y2="38.9999" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffd748" />
              <stop offset=".5362" stopColor="#ffcd48" />
              <stop offset="1" stopColor="#ffcb48" />
            </linearGradient>
            <linearGradient id="atlas-grad-b" x1="19.9976" y1="34.5164" x2="19.9976" y2="15.3186" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffad00" />
              <stop offset="1" stopColor="#ff7600" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * 3. Stripe Platform Electric Cyan Wave
 * Direct asset from stripe.com/index.html: platform-graphic-background_2x.png
 * Brilliant electric cyan-blue silk wave with feather-soft left fade.
 */
export function StripePlatformBlueWaveArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none overflow-hidden select-none">
      <img
        src="https://images.stripeassets.com/fzn2n1nzq965/5dQAw5oJf3TOO1Jt6IKDRH/f391594c11f38d821259acdd3412a7a6/platform-graphic-background_2x.png?w=800&fm=webp&q=90"
        alt=""
        className="w-full h-full object-cover object-left"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
        }}
      />
    </div>
  );
}

/**
 * 4. Stripe Connect Emerald Ribbon Wave
 * Direct asset from stripe.com/index.html: connect-bento-card-background-image.jpg
 * Deep emerald, mint, and teal silk wave with silky, unnoticeable fade.
 */
export function StripeConnectEmeraldWaveArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none overflow-hidden select-none">
      <img
        src="https://images.stripeassets.com/fzn2n1nzq965/3NcSrMqMgaKe75QNr8wZI8/46d520dfc48c5b9f1c59dcde9460b58c/connect-bento-card-background-image.jpg?w=1232&fm=webp&q=90"
        alt=""
        className="w-full h-full object-cover object-left"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
        }}
      />
    </div>
  );
}

/**
 * 5. Stripe Sessions Deep Ultraviolet Cosmic Glow
 * Direct asset from stripe.com/index.html: sessions-2026-on-demand-bg.png
 * Atmospheric ultraviolet and midnight violet flow with progressive alpha fade.
 */
export function StripeSessionsCosmicArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none overflow-hidden select-none">
      <img
        src="https://images.stripeassets.com/fzn2n1nzq965/2YFdgdFPeIiDpmQbhHPAx8/186752498bf713fea245f31bcec84f8a/sessions-2026-on-demand-bg.png?w=800&fm=webp&q=90"
        alt=""
        className="w-full h-full object-cover object-left"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
        }}
      />
    </div>
  );
}

/**
 * 6. Stripe Sunset Golden-Violet Wave
 * Direct asset from stripe.com/index.html: wave_crop.jpg
 * Warm golden-amber and violet silk wave with feather-soft boundary.
 */
export function StripeSunsetWaveArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none overflow-hidden select-none">
      <img
        src="https://images.stripeassets.com/fzn2n1nzq965/m9HBEK464p46FeNIhs2PV/f5054a93c8a0a6aabdd1c47675d610ae/wave_crop.jpg?w=816&fm=webp&q=80"
        alt=""
        className="w-full h-full object-cover object-left"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 12%, rgba(0,0,0,0.4) 32%, rgba(0,0,0,0.85) 60%, black 100%)',
        }}
      />
    </div>
  );
}

/**
 * 7. Stripe Sapphire 3D Origami Prism
 * Complementary 3D faceted crystal origami diamond in electric sapphire and cobalt.
 */
export function StripeSapphirePrismArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[44%] pointer-events-none overflow-hidden select-none flex items-center justify-end">
      <div className="relative w-full h-[130%] flex items-center justify-end -mr-2">
        <svg
          viewBox="0 0 40 40"
          className="w-auto h-[125%] max-h-[260px] object-contain drop-shadow-[0_8px_20px_rgba(99,91,255,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M19.9952 1c.9747 0 1.8657.5513 2.3006 1.42365l7.9975 15.99495 8.425 16.8558c.3991.7977.3569 1.7452-.1118 2.5041-.3437.5566-.8808.9537-1.4945 1.126l-.1692.0412c-.114.0238-.2301.04-.3478.0481L36.4176 39l-16.4224-3.2655L9.69702 18.4186 17.6945 2.42365C18.1295 1.5513 19.0204 1 19.9952 1"
            fill="#38bdf8"
          />
          <path
            d="M19.9952 1c.9748 0 1.8657.5513 2.3007 1.42365l7.9975 15.99495-10.2982 17.3159L3.5728 39c-.892 0-1.72022-.4625-2.1889-1.2215-.468672-.7589-.510968-1.7064-.11178-2.5041l8.42495-16.8558L17.6945 2.42365C18.1295 1.5513 19.0204 1 19.9952 1"
            fill="url(#sapphire-grad-a)"
          />
          <path
            d="M19.9952 1c.9747 0 1.8657.5513 2.3006 1.42365l7.9975 15.99495-10.2981 17.3159L9.69702 18.4186 17.6945 2.42365c.4078-.81782 1.2163-1.35348 2.119-1.41725z"
            fill="url(#sapphire-grad-b)"
          />
          <defs>
            <linearGradient id="sapphire-grad-a" x1="15.6303" y1="18.2379" x2="15.545" y2="38.9999" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60a5fa" />
              <stop offset=".5362" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="sapphire-grad-b" x1="19.9976" y1="34.5164" x2="19.9976" y2="15.3186" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#4338ca" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * 8. Stripe Emerald 3D Origami Prism
 * Complementary 3D faceted crystal origami diamond in mint and deep emerald.
 */
export function StripeEmeraldPrismArt() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[44%] pointer-events-none overflow-hidden select-none flex items-center justify-end">
      <div className="relative w-full h-[130%] flex items-center justify-end -mr-2">
        <svg
          viewBox="0 0 40 40"
          className="w-auto h-[125%] max-h-[260px] object-contain drop-shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M19.9952 1c.9747 0 1.8657.5513 2.3006 1.42365l7.9975 15.99495 8.425 16.8558c.3991.7977.3569 1.7452-.1118 2.5041-.3437.5566-.8808.9537-1.4945 1.126l-.1692.0412c-.114.0238-.2301.04-.3478.0481L36.4176 39l-16.4224-3.2655L9.69702 18.4186 17.6945 2.42365C18.1295 1.5513 19.0204 1 19.9952 1"
            fill="#34d399"
          />
          <path
            d="M19.9952 1c.9748 0 1.8657.5513 2.3007 1.42365l7.9975 15.99495-10.2982 17.3159L3.5728 39c-.892 0-1.72022-.4625-2.1889-1.2215-.468672-.7589-.510968-1.7064-.11178-2.5041l8.42495-16.8558L17.6945 2.42365C18.1295 1.5513 19.0204 1 19.9952 1"
            fill="url(#emerald-grad-a)"
          />
          <path
            d="M19.9952 1c.9747 0 1.8657.5513 2.3006 1.42365l7.9975 15.99495-10.2981 17.3159L9.69702 18.4186 17.6945 2.42365c.4078-.81782 1.2163-1.35348 2.119-1.41725z"
            fill="url(#emerald-grad-b)"
          />
          <defs>
            <linearGradient id="emerald-grad-a" x1="15.6303" y1="18.2379" x2="15.545" y2="38.9999" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ee7b7" />
              <stop offset=".5362" stopColor="#10b981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="emerald-grad-b" x1="19.9976" y1="34.5164" x2="19.9976" y2="15.3186" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
