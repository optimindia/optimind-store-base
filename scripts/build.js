#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Build para Cloudflare Pages.
// Empaqueta las tiendas generadas y de referencia en dist/ para deploy.
// Copia el dossier de portfolio mantenible desde showcase/.

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'dist');
const showcaseDir = path.join(root, 'showcase');
const clientsDir = path.join(root, 'clients');
const adminDir = path.join(root, 'admin');

const stores = [
  {
    slug: 'moda-lucia',
    source: 'examples/fashion',
    wordmark: 'Lucía',
    wordmarkFont: "'Bodoni Moda', Georgia, serif",
    quote: 'Piezas que se viven antes de usar.',
    vibe: 'Atelier femenino, luz suave, firma dorada.',
    paper: '#F6F4F1',
    ink: '#1B1714',
    accent: '#2B3A4E',
    accent2: '#BFA474',
    previewSvg: `
      <svg viewBox="0 0 360 260" width="100%25" height="100%25" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="260" fill="#F6F4F1"/>
        <circle cx="290" cy="50" r="130" fill="none" stroke="#BFA474" stroke-width="1" opacity="0.22"/>
        <path d="M180 8c12 0 22-10 22-22h-44c0 12 10 22 22 22z" fill="#BFA474"/>
        <path d="M180 8v55" stroke="#BFA474" stroke-width="5" stroke-linecap="round"/>
        <path d="M75 145c35-55 80-78 105-78s80 23 105 78" stroke="#BFA474" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M120 145 h120 v135 a14 14 0 0 1 -14 14 h-92 a14 14 0 0 1 -14 -14 z" fill="#2B3A4E" opacity="0.05"/>
        <path d="M140 165 h100 v105 a10 10 0 0 1 -10 10 h-80 a10 10 0 0 1 -10 -10 z" fill="#FFFFFF"/>
        <path d="M140 165 h100 v48 h-100 z" fill="#EADFD4" opacity="0.55"/>
        <path d="M140 213 h100" stroke="#BFA474" stroke-width="1.5" opacity="0.4"/>
        <rect x="220" y="175" width="24" height="16" rx="2" fill="#BFA474" opacity="0.35"/>
        <text x="180" y="245" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="#1B1714" opacity="0.55">Edición limitada</text>
      </svg>`
  },
  {
    slug: 'todo-en-casa',
    source: 'examples/general',
    wordmark: 'Todo en Casa',
    wordmarkFont: "'Space Grotesk', system-ui, sans-serif",
    quote: 'Lo que usás todos los días.',
    vibe: 'Almacén de barrio, claro y confiable.',
    paper: '#F5F3EF',
    ink: '#1A1A1A',
    accent: '#3E5641',
    accent2: '#D4A056',
    previewSvg: `
      <svg viewBox="0 0 360 260" width="100%25" height="100%25" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="260" fill="#F5F3EF"/>
        <circle cx="55" cy="215" r="150" fill="none" stroke="#D4A056" stroke-width="1" opacity="0.18"/>
        <path d="M180 50 L265 108 V222 H95 V108 Z" fill="#FFFFFF" stroke="#3E5641" stroke-width="3"/>
        <path d="M180 50 L95 108 H265 L180 50 Z" fill="#E9E4DB"/>
        <rect x="163" y="162" width="54" height="70" rx="6" fill="#3E5641" opacity="0.12"/>
        <rect x="170" y="170" width="40" height="54" rx="4" fill="#FFFFFF"/>
        <circle cx="180" cy="108" r="14" fill="#D4A056"/>
        <rect x="169" y="145" width="22" height="28" rx="3" fill="#E9E4DB"/>
        <rect x="210" y="180" width="34" height="26" rx="3" fill="#3E5641" opacity="0.15"/>
        <text x="180" y="250" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#1A1A1A" opacity="0.55">Precio claro</text>
      </svg>`
  },
  {
    slug: 'raices-del-norte',
    source: 'examples/artisan',
    wordmark: 'Raíces',
    wordmarkFont: "'Alegreya', Georgia, serif",
    quote: 'Objetos con origen, no con etiqueta.',
    vibe: 'Artesanía del norte, tierra y telar.',
    paper: '#F7F3EB',
    ink: '#2C241F',
    accent: '#A35C42',
    accent2: '#D4A056',
    previewSvg: `
      <svg viewBox="0 0 360 260" width="100%25" height="100%25" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="260" fill="#F7F3EB"/>
        <circle cx="300" cy="210" r="135" fill="none" stroke="#D4A056" stroke-width="1" opacity="0.2"/>
        <rect x="120" y="38" width="120" height="170" rx="8" fill="#FFFFFF" stroke="#A35C42" stroke-width="2.5"/>
        <path d="M120 82 h120 M120 126 h120 M120 170 h120" stroke="#E8D5B5" stroke-width="12"/>
        <path d="M145 54 v138 M180 54 v138 M215 54 v138" stroke="#A35C42" stroke-width="2.5" opacity="0.32"/>
        <path d="M180 182 l-26 26 l26 26 l26 -26 z" fill="#A35C42"/>
        <circle cx="145" cy="104" r="6" fill="#A35C42" opacity="0.5"/>
        <circle cx="215" cy="148" r="6" fill="#A35C42" opacity="0.5"/>
        <text x="180" y="245" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="#2C241F" opacity="0.55">Hecho a mano</text>
      </svg>`
  }
];

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function copyDir(src, dst, ignore = []) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (ignore.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, dstPath, ignore);
    else fs.copyFileSync(srcPath, dstPath);
  }
}

function buildLanding() {
  const items = stores
    .filter((s) => fs.existsSync(path.join(outDir, s.slug, 'index.html')))
    .map((s, i) => `      <li class="showcase-card" data-index="${i}" style="--store-accent:${s.accent2};--store-ink:${s.ink};--store-paper:${s.paper};--store-font:${s.wordmarkFont};">
        <a class="showcase-link" href="./${s.slug}/" aria-label="Ver tienda de referencia ${s.wordmark}">
          <span class="showcase-number">0${i + 1} · ${s.vibe}</span>
          <span class="showcase-frame">
            <span class="showcase-preview" role="img" aria-label="Vista previa de ${s.wordmark}">${s.previewSvg}</span>
          </span>
          <span class="showcase-meta">
            <span class="showcase-wordmark">${s.wordmark}</span>
            <span class="showcase-quote">${s.quote}</span>
          </span>
          <span class="showcase-cta">Abrir vitrina <span aria-hidden="true">↗</span></span>
        </a>
      </li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OptiMind IA · Tiendas online que venden</title>
  <meta name="description" content="Tres tiendas de referencia con catálogo, carrito y checkout por WhatsApp. Hechas para campañas de Meta Ads.">
  <meta name="theme-color" content="#0a0713">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Archivo:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Bodoni+Moda:opsz,wght@6..96,700&family=Alegreya:wght@700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    :root {
      --bg: #0a0713;
      --bg-1: #140d24;
      --bg-2: #1a112e;
      --surface: rgba(255,255,255,0.04);
      --surface-2: rgba(255,255,255,0.07);
      --text: #f0ecfb;
      --text-2: #a99fc4;
      --text-3: #6e6291;
      --accent: #9d7bff;
      --accent-2: #5ad1ff;
      --accent-deep: #6a4fcf;
      --gold: #d4b0ff;
      --border: rgba(255,255,255,0.10);
      --radius-sm: 12px;
      --radius: 22px;
      --radius-lg: 34px;
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
      --container: min(1280px, calc(100vw - 48px));
    }
    html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      min-width: 320px;
      background: var(--bg);
      color: var(--text);
      font-family: 'Archivo', system-ui, sans-serif;
      font-size: 17px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    a { color: inherit; text-decoration: none; }
    h1, h2, h3, p, ul, ol { margin: 0; }
    ul, ol { padding: 0; list-style: none; }
    img, svg { display: block; max-width: 100%; }
    .sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
    .grain {
      position: fixed; inset: 0; z-index: 998; pointer-events: none;
      opacity: 0.04; mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    }
    .aurora {
      position: fixed; inset: 0; z-index: -2; pointer-events: none;
      background:
        radial-gradient(ellipse 80% 60% at 20% 30%, rgba(157,123,255,0.18), transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 20%, rgba(90,209,255,0.12), transparent 55%),
        radial-gradient(ellipse 90% 70% at 60% 80%, rgba(157,123,255,0.10), transparent 60%),
        var(--bg);
      animation: auroraMove 18s ease-in-out infinite alternate;
    }
    @keyframes auroraMove {
      from { transform: translate3d(-2%, -1%, 0) scale(1.02); }
      to { transform: translate3d(2%, 1%, 0) scale(1.05); }
    }
    .site-header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 90;
      display: flex; align-items: center; justify-content: space-between;
      padding: 22px max(24px, calc((100vw - var(--container)) / 2));
      border-bottom: 1px solid transparent;
      transition: border-color 260ms ease, background 260ms ease;
    }
    .site-header.scrolled {
      background: rgba(10,7,19,0.78);
      backdrop-filter: blur(18px) saturate(130%);
      border-bottom-color: var(--border);
    }
    .brand {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.03em;
    }
    .brand-mark {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      box-shadow: 0 6px 22px rgba(157,123,255,0.35);
      position: relative;
    }
    .brand-mark::after {
      content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--bg); box-shadow: inset 0 0 0 4px var(--text);
    }
    .header-cta {
      padding: 10px 18px; border-radius: 999px;
      border: 1px solid var(--border); background: var(--surface);
      font-weight: 600; font-size: 14px;
      transition: background 220ms ease, border-color 220ms ease;
    }
    .header-cta:hover { background: var(--surface-2); border-color: var(--accent); }
    .hero {
      position: relative; isolation: isolate;
      min-height: min(100svh, 900px); display: grid; place-items: center;
      padding: 140px 24px 80px;
    }
    .hero-copy { position: relative; z-index: 2; max-width: 980px; text-align: center; }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 12px;
      margin-bottom: 28px;
      font-family: 'Space Mono', monospace; font-size: 12px;
      letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-2);
    }
    .hero-eyebrow::before, .hero-eyebrow::after {
      content: ''; width: 28px; height: 1px; background: currentColor;
    }
    .hero h1 {
      font-family: 'Syne', sans-serif; font-weight: 800;
      font-size: clamp(56px, 10vw, 132px); letter-spacing: -0.05em; line-height: 0.92;
      text-wrap: balance; margin-bottom: 28px;
    }
    .hero h1 em {
      font-style: normal;
      background: linear-gradient(100deg, var(--accent), var(--accent-2) 55%, var(--gold));
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .hero-lead {
      max-width: 620px; margin: 0 auto 42px;
      color: var(--text-2); font-size: clamp(18px, 2.2vw, 22px); line-height: 1.55;
    }
    .hero-actions {
      display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap;
    }
    .button {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 16px 28px; border-radius: 999px; font-weight: 700; font-size: 16px;
      transition: transform 220ms var(--ease), box-shadow 220ms var(--ease), background 220ms ease;
    }
    .button:hover { transform: translateY(-2px); }
    .button-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #0a0713; box-shadow: 0 14px 40px rgba(157,123,255,0.35);
    }
    .button-primary:hover { box-shadow: 0 18px 50px rgba(157,123,255,0.45); }
    .button-secondary {
      border: 1px solid var(--border); background: var(--surface); color: var(--text);
    }
    .button-secondary:hover { background: var(--surface-2); }
    .metrics {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
      max-width: var(--container); margin: 0 auto; padding: 0 24px;
      border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
      background: var(--border);
    }
    .metric {
      padding: 36px 24px; text-align: center; background: rgba(10,7,19,0.55);
      backdrop-filter: blur(10px);
    }
    .metric strong {
      display: block; font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 700;
      color: var(--accent-2); line-height: 1;
    }
    .metric span {
      display: block; margin-top: 8px;
      font-size: 13px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em;
    }
    .showcase {
      padding: 140px 24px 160px;
    }
    .showcase-header {
      max-width: var(--container); margin: 0 auto 64px;
      display: flex; align-items: end; justify-content: space-between; gap: 40px; flex-wrap: wrap;
    }
    .showcase-header h2 {
      font-family: 'Syne', sans-serif; font-weight: 700;
      font-size: clamp(38px, 5vw, 64px); letter-spacing: -0.04em; line-height: 1.05;
      max-width: 12ch;
    }
    .showcase-header h2 em { font-style: normal; color: var(--accent); }
    .showcase-header p {
      max-width: 380px; color: var(--text-2); font-size: 18px; line-height: 1.5;
    }
    .showcase-list {
      max-width: var(--container); margin: 0 auto;
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
    }
    .showcase-card {
      position: relative;
      --spotlight-x: 50%; --spotlight-y: 50%;
    }
    .showcase-wordmark { font-family: var(--store-font); }
    .showcase-card:nth-child(1) .showcase-wordmark { color: #BFA474; }
    .showcase-card:nth-child(2) .showcase-wordmark { color: #3E5641; }
    .showcase-card:nth-child(3) .showcase-wordmark { color: #A35C42; }
    .showcase-card:nth-child(1) .showcase-number { color: #BFA474; }
    .showcase-card:nth-child(2) .showcase-number { color: #3E5641; }
    .showcase-card:nth-child(3) .showcase-number { color: #A35C42; }
    .showcase-card:nth-child(2) .showcase-cta { color: #D4A056; }
    .showcase-card:nth-child(3) .showcase-cta { color: #D4A056; }
    .showcase-link {
      display: flex; flex-direction: column; gap: 22px;
      padding: 28px; border-radius: var(--radius-lg);
      background: linear-gradient(180deg, var(--surface), rgba(255,255,255,0.02));
      border: 1px solid var(--border);
      position: relative; overflow: hidden;
      transition: transform 360ms var(--ease), border-color 360ms ease, box-shadow 360ms ease;
    }
    .showcase-link::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(circle 260px at var(--spotlight-x) var(--spotlight-y),
        color-mix(in srgb, var(--store-accent) 30%, transparent), transparent 70%);
      opacity: 0; transition: opacity 420ms ease;
    }
    .showcase-link::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      border-radius: inherit;
      border: 1px solid transparent;
      background: radial-gradient(circle 220px at var(--spotlight-x) var(--spotlight-y),
        color-mix(in srgb, var(--store-accent) 75%, transparent), transparent 70%) border-box;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      opacity: 0; transition: opacity 420ms ease;
    }
    .showcase-card:hover .showcase-link { transform: translateY(-8px) scale(1.01); border-color: rgba(157,123,255,0.35); box-shadow: 0 30px 80px rgba(0,0,0,0.35); }
    .showcase-card:hover .showcase-link::before { opacity: 1; }
    .showcase-card:hover .showcase-link::after { opacity: 1; }
    .showcase-number {
      font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 0.1em;
      color: var(--text-3); text-transform: uppercase;
    }
    .showcase-frame {
      position: relative; aspect-ratio: 4/3; border-radius: var(--radius);
      background: var(--bg-1); border: 1px solid var(--border);
      overflow: hidden; box-shadow: inset 0 0 80px rgba(0,0,0,0.35), 0 18px 50px rgba(0,0,0,0.25);
      transition: transform 360ms var(--ease), box-shadow 360ms ease;
    }
    .showcase-preview {
      position: absolute; inset: 0; border-radius: var(--radius); overflow: hidden;
      background: linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.12) 100%);
      transition: transform 500ms var(--ease);
    }
    .showcase-preview svg { width: 100%; height: 100%; }
    .showcase-card:hover .showcase-frame { transform: translateY(-4px) scale(1.01); box-shadow: inset 0 0 80px rgba(0,0,0,0.3), 0 26px 70px rgba(0,0,0,0.35); }
    .showcase-card:hover .showcase-preview { transform: scale(1.03); }
    .showcase-meta {
      display: flex; flex-direction: column; gap: 6px;
    }
    .showcase-wordmark {
      font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05;
    }
    .showcase-quote {
      font-size: 15px; color: var(--text-2); line-height: 1.45;
    }
    .showcase-cta {
      display: inline-flex; align-items: center; gap: 10px;
      margin-top: 14px; padding: 10px 18px;
      border-radius: 999px; border: 1px solid var(--border); background: var(--surface);
      font-weight: 700; font-size: 14px; color: var(--accent-2);
      transition: gap 220ms var(--ease), transform 220ms var(--ease), background 220ms ease, border-color 220ms ease;
    }
    .showcase-card:hover .showcase-cta { gap: 16px; transform: translateX(4px); background: rgba(255,255,255,0.08); border-color: var(--store-accent); }
    .showcase-wordmark {
      font-size: 30px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05;
    }
    .showcase-quote { font-size: 15px; color: var(--text-2); line-height: 1.45; }
    .how {
      padding: 120px 24px; background: var(--bg-1); border-top: 1px solid var(--border);
    }
    .how-inner {
      max-width: var(--container); margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1.4fr; gap: 80px; align-items: start;
    }
    .how h2 {
      font-family: 'Syne', sans-serif; font-weight: 700;
      font-size: clamp(34px, 4.5vw, 54px); letter-spacing: -0.04em; line-height: 1.05;
    }
    .how h2 em { font-style: normal; color: var(--accent); }
    .how p { color: var(--text-2); margin-top: 18px; font-size: 18px; line-height: 1.5; }
    .how-steps {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
    }
    .how-step {
      padding: 32px 28px; border-radius: var(--radius);
      background: var(--surface); border: 1px solid var(--border);
    }
    .how-step span {
      display: inline-block; margin-bottom: 20px;
      font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: var(--accent);
      line-height: 1;
    }
    .how-step h3 { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
    .how-step p { margin: 0; font-size: 15px; color: var(--text-2); }
    .closing {
      padding: 140px 24px; text-align: center;
      background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(157,123,255,0.12), transparent 65%);
    }
    .closing h2 {
      font-family: 'Syne', sans-serif; font-weight: 800;
      font-size: clamp(44px, 7vw, 92px); letter-spacing: -0.04em; line-height: 0.95;
      max-width: 14ch; margin: 0 auto 36px;
    }
    .closing h2 em { font-style: normal; color: var(--accent-2); }
    .closing p { color: var(--text-2); font-size: 20px; margin-bottom: 18px; }
    .footer {
      padding: 56px 24px 42px; border-top: 1px solid var(--border);
      text-align: center; color: var(--text-3); font-size: 14px;
    }
    .footer a { color: var(--text-2); text-decoration: underline; text-underline-offset: 3px; }
    .footer a:hover { color: var(--accent-2); }
    @media (max-width: 1020px) {
      .showcase-list { grid-template-columns: 1fr; max-width: 620px; }
      .showcase-card { max-width: 100%; }
      .how-inner { grid-template-columns: 1fr; gap: 48px; }
      .how-steps { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      .hero h1 { font-size: clamp(44px, 13vw, 80px); }
      .metrics { grid-template-columns: 1fr; }
      .showcase-header { flex-direction: column; align-items: flex-start; }
    }
    @media (prefers-reduced-motion: reduce) {
      .aurora { animation: none; }
      .showcase-link, .showcase-card:hover .showcase-link { transition: none; transform: none; }
    }
  </style>
</head>
<body>
  <div class="aurora" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <header class="site-header" id="site-header">
    <a class="brand" href="https://optimindia.site" target="_blank" rel="noopener">
      <span class="brand-mark" aria-hidden="true"></span>
      OptiMind IA
    </a>
    <a class="header-cta" href="https://wa.me/5492616027055" target="_blank" rel="noopener">Hablemos por WhatsApp</a>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="hero-eyebrow">Showroom de tiendas</p>
        <h1 id="hero-title">Tiendas online<br>que <em>venden.</em></h1>
        <p class="hero-lead">Tres vitrinas de referencia con el mismo motor: catálogo, carrito persistente y checkout por WhatsApp. Creadas para convertir tráfico de Meta Ads en pedidos reales.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#vitrinas">Ver las tiendas <span aria-hidden="true">↘</span></a>
          <a class="button button-secondary" href="https://github.com/optimindia/optimind-store-base" target="_blank" rel="noopener">Ver el motor</a>
        </div>
      </div>
    </section>

    <section class="metrics" aria-label="Métricas del motor">
      <div class="metric"><strong>3</strong><span>Tiendas de referencia</span></div>
      <div class="metric"><strong>33</strong><span>Tests automatizados</span></div>
      <div class="metric"><strong>24h</strong><span>Desde el brief al aire</span></div>
    </section>

    <section class="showcase" id="vitrinas" aria-labelledby="showcase-title">
      <div class="showcase-header">
        <h2 id="showcase-title">Cada una con su propia <em>piel.</em></h2>
        <p>Misma robustez de motor, distinta voz de marca. Elegí una para ver cómo se siente comprar.</p>
      </div>
      <ul class="showcase-list">
${items}
      </ul>
    </section>

    <section class="how" aria-labelledby="how-title">
      <div class="how-inner">
        <div>
          <h2 id="how-title">Del brief a tu dominio en <em>tres pasos.</em></h2>
          <p>No reinventamos nada. Tomamos el motor probado, le ponemos la marca del cliente y desplegamos.</p>
        </div>
        <ol class="how-steps">
          <li class="how-step"><span>1</span><h3>Configurar</h3><p>Adaptamos catálogo, WhatsApp, envío y marca desde <code>store.config.js</code>.</p></li>
          <li class="how-step"><span>2</span><h3>Verificar</h3><p>Corremos tests, revisamos checkout y hacemos un pedido de prueba real.</p></li>
          <li class="how-step"><span>3</span><h3>Publicar</h3><p>Deploy automático a Cloudflare Pages con dominio gratis <code>*.pages.dev</code>.</p></li>
        </ol>
      </div>
    </section>

    <section class="closing" aria-labelledby="closing-title">
      <p>No es solo una web. Es una máquina de pedidos.</p>
      <h2 id="closing-title">Encendé tu tienda <em>ahora.</em></h2>
      <a class="button button-primary" href="https://wa.me/5492616027055" target="_blank" rel="noopener">Escribinos por WhatsApp <span aria-hidden="true">→</span></a>
    </section>
  </main>

  <footer class="footer">
    <p>OptiMind IA · Tiendas online que venden · <a href="https://wa.me/5492616027055" target="_blank" rel="noopener">+54 9 2616 02-7055</a></p>
    <p style="margin-top:8px;opacity:.7;">Desde $150.000 ARS · Cupos limitados</p>
  </footer>

  <script>
    // Header scroll
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    // Spotlight cursor
    const cards = document.querySelectorAll('.showcase-card');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach(card => {
        const link = card.querySelector('.showcase-link');
        card.addEventListener('mousemove', (e) => {
          const rect = link.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          link.style.setProperty('--spotlight-x', x + '%');
          link.style.setProperty('--spotlight-y', y + '%');
        });
      });
    }
  </script>
</body>
</html>
`;
}

console.log('Limpiando dist/...');
rmDir(outDir);
fs.mkdirSync(outDir, { recursive: true });

console.log('Copiando tiendas...');
for (const store of stores) {
  const src = path.join(root, store.source);
  const dst = path.join(outDir, store.slug);
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ Saltando ${store.slug}: no existe ${store.source}`);
    continue;
  }
  copyDir(src, dst, ['captura.png', 'captura-full.png', 'captura-full2.png', 'captura-full3.png', 'captura-inicio.png', 'captura-completa.png', '.git']);
  console.log(`  ✓ ${store.slug}`);
}

console.log('Copiando tiendas de clientes...');
if (fs.existsSync(clientsDir)) {
  const reservedSlugs = new Set(stores.map((store) => store.slug));
  for (const entry of fs.readdirSync(clientsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (reservedSlugs.has(entry.name)) {
      throw new Error(`El cliente ${entry.name} usa una ruta reservada por una tienda de referencia.`);
    }
    copyDir(path.join(clientsDir, entry.name), path.join(outDir, entry.name));
    console.log(`  Cliente: ${entry.name}`);
  }
}

console.log('Copiando dossier de portfolio...');
copyDir(showcaseDir, outDir);

if (fs.existsSync(adminDir)) {
  copyDir(adminDir, path.join(outDir, 'admin'));
  console.log('  Panel privado: admin');
}

console.log('Build completo en dist/');
