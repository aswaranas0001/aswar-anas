/**
 * Utility functions for sharing AIR RADAR AI links, deep linking,
 * and social media integration.
 */

export interface ShareOptions {
  flightNumber?: string;
  airportIata?: string;
  baseUrl?: string;
}

/**
 * Returns the sanitized, canonical URL for AIR RADAR AI
 */
export function getBaseAppUrl(customBase?: string): string {
  if (customBase && customBase.trim().length > 0) {
    return customBase.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin + window.location.pathname.replace(/\/+$/, '');
  }
  return 'https://ais-pre-g3za4n633d7gxm76bidgrl-1067843729934.asia-southeast1.run.app';
}

/**
 * Constructs a shareable URL with optional deep link parameters
 */
export function generateShareUrl(options: ShareOptions = {}): string {
  const base = getBaseAppUrl(options.baseUrl);
  const url = new URL(base.startsWith('http') ? base : `https://${base}`);

  if (options.flightNumber) {
    url.searchParams.set('flight', options.flightNumber.replace(/\s+/g, '').toUpperCase());
  } else if (options.airportIata) {
    url.searchParams.set('airport', options.airportIata.toUpperCase());
  }

  return url.toString();
}

/**
 * Generates descriptive share message text for social sharing
 */
export function generateShareText(options: ShareOptions = {}): string {
  if (options.flightNumber) {
    return `Pantau penerbangan ${options.flightNumber} secara live di AIR RADAR AI - Radar Pesawat Indonesia`;
  }
  if (options.airportIata) {
    return `Pantau lalu lintas penerbangan & cuaca Bandara ${options.airportIata} secara live di AIR RADAR AI`;
  }
  return `Pantau lalu lintas pesawat terbang di seluruh wilayah udara Indonesia secara live real-time di AIR RADAR AI`;
}

/**
 * Generates direct sharing links for popular messaging and social platforms
 */
export function getSocialShareLinks(url: string, text: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text} ✈️📡\n${url}`);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}&hashtags=AirRadarAI,AviationIndonesia,FlightRadar`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent('Link Website AIR RADAR AI - Live Aircraft Tracking')}&body=${encodedText}`,
  };
}

/**
 * Generates responsive embed HTML code snippet for websites/blogs
 */
export function generateEmbedCode(url: string, title = 'AIR RADAR AI'): string {
  return `<iframe src="${url}" width="100%" height="600" title="${title}" frameborder="0" allow="geolocation" style="border: 1px solid #334155; border-radius: 12px; overflow: hidden;" allowfullscreen></iframe>`;
}
