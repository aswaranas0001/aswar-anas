import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBaseAppUrl,
  generateShareUrl,
  generateShareText,
  getSocialShareLinks,
  generateEmbedCode,
} from './share';

test('getBaseAppUrl returns default URL when in non-browser environment with no custom base', () => {
  const url = getBaseAppUrl();
  assert.ok(url.includes('asia-southeast1.run.app'));
});

test('generateShareUrl correctly adds flight parameter', () => {
  const url = generateShareUrl({
    baseUrl: 'https://air-radar.ai',
    flightNumber: 'GA 404',
  });
  assert.equal(url, 'https://air-radar.ai/?flight=GA404');
});

test('generateShareUrl correctly adds airport parameter', () => {
  const url = generateShareUrl({
    baseUrl: 'https://air-radar.ai',
    airportIata: 'cgk',
  });
  assert.equal(url, 'https://air-radar.ai/?airport=CGK');
});

test('generateShareText produces informative messages', () => {
  const defaultText = generateShareText();
  assert.ok(defaultText.includes('AIR RADAR AI'));

  const flightText = generateShareText({ flightNumber: 'GA 404' });
  assert.ok(flightText.includes('GA 404'));

  const airportText = generateShareText({ airportIata: 'DPS' });
  assert.ok(airportText.includes('DPS'));
});

test('getSocialShareLinks returns properly formatted URLs for platforms', () => {
  const links = getSocialShareLinks('https://air-radar.ai', 'Pantau pesawat');
  assert.ok(links.whatsapp.startsWith('https://api.whatsapp.com/send?text='));
  assert.ok(links.telegram.startsWith('https://t.me/share/url?'));
  assert.ok(links.twitter.startsWith('https://twitter.com/intent/tweet?'));
  assert.ok(links.facebook.startsWith('https://www.facebook.com/sharer/sharer.php?'));
});

test('generateEmbedCode creates valid HTML iframe string', () => {
  const embed = generateEmbedCode('https://air-radar.ai', 'AIR RADAR AI');
  assert.ok(embed.includes('<iframe'));
  assert.ok(embed.includes('https://air-radar.ai'));
  assert.ok(embed.includes('title="AIR RADAR AI"'));
});
