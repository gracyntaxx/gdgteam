'use client';

import React from 'react';
import Link from 'next/link';
import { LandingHeroCanvas } from './LandingHeroCanvas';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Box,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mic,
  Maximize,
  Compass,
  CheckCircle2,
  Database,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const featureCards = [
    {
      number: '01',
      title: 'Visual Reconstruction',
      tag: 'PURE Pi3 Pipeline',
      description:
        'Transforms 2D photographs, architectural floor plans, or short videos into editable, dense 3D point clouds and room geometries using state-of-the-art vision models.',
      icon: Box,
      metric: '304,584 Vertices',
      detail: 'Dual-view photographic alignment tested with FunnyGuy525/RefinedModel checkpoint.',
    },
    {
      number: '02',
      title: 'Spatial Intelligence',
      tag: 'YOLO11-seg & Geometry',
      description:
        'Automated multi-category object detection, instance segmentation, bounding volume calculation, collision checking, and egress pathway clearance enforcement.',
      icon: ShieldCheck,
      metric: 'Zero Collision Violations',
      detail: 'Deterministic spatial rules guarantee clearance around doorways, corridors, and focal zones.',
    },
    {
      number: '03',
      title: 'Natural-Language & Voice Editing',
      tag: 'Multimodal AI Engine',
      description:
        'Modify wall colors, reposition sofa layouts, swap flooring, and iterate in real-time using conversational voice commands or structured prompts.',
      icon: Mic,
      metric: '< 800ms Latency',
      detail: 'Translates natural speech into version-controlled JSON scene graph transformations.',
    },
  ];

  const techBadges = [
    { label: 'Next.js 15 & React 19', category: 'Frontend' },
    { label: 'Three.js & WebGL', category: '3D Engine' },
    { label: 'PURE Pi3 & PyTorch', category: 'Reconstruction' },
    { label: 'Ultralytics YOLO11-seg', category: 'Segmentation' },
    { label: 'Python & FastAPI', category: 'Backend Engine' },
    { label: 'Google Colab NVIDIA T4', category: 'Inference' },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#16191f] text-white font-ember flex flex-col justify-between selection:bg-[#ff9900] selection:text-[#16191f]">
      {/* Hero Section */}
      <section className="relative px-6 py-12 md:py-16 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading, Subtitle & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 z-10">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">
              AWS Builder Center Architecture
            </Badge>
            <Badge variant="accent" size="md">
              GDG Hackathon 2026
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="text-[38px] sm:text-[46px] lg:text-[52px] font-normal tracking-tight text-white leading-[1.15]">
              Spatial Intelligence & <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9900] via-[#ffba52] to-[#7300e5]">
                3D Interior Design
              </span>
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#8c8c94] max-w-xl leading-relaxed">
              ArchiTech converts ordinary room photographs and floor plans into interactive,
              physically verified 3D spaces. Edit layouts with natural voice commands and explore
              tailored renovations instantly.
            </p>
          </div>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/workspace">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="shadow-[0px_4px_25px_rgba(255,153,0,0.3)] hover:shadow-[0px_6px_30px_rgba(255,153,0,0.45)]"
              >
                Visualize Space
              </Button>
            </Link>

            <Link href="/renovation">
              <Button variant="secondary" size="lg" leftIcon={<Layers className="w-4 h-4 text-[#ff9900]" />}>
                Explore Catalog & Renovation
              </Button>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#232b37] w-full max-w-lg">
            <div>
              <span className="text-[20px] font-bold text-white font-mono block">2 Photos</span>
              <span className="text-[12px] text-[#687078]">Reconstruction Input</span>
            </div>
            <div>
              <span className="text-[20px] font-bold text-[#ff9900] font-mono block">100% Valid</span>
              <span className="text-[12px] text-[#687078]">Spatial Clearance</span>
            </div>
            <div>
              <span className="text-[20px] font-bold text-[#00e582] font-mono block">Zero Setup</span>
              <span className="text-[12px] text-[#687078]">Interactive WebGL</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Room Hero Platter */}
        <div className="lg:col-span-5 h-[420px] sm:h-[480px] w-full relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7300e5]/20 via-transparent to-[#ff9900]/15 rounded-[12px] blur-3xl pointer-events-none" />
          <div className="relative w-full h-full bg-[#1b222d]/60 border border-[#232b37] rounded-[8px] overflow-hidden shadow-[0px_10px_40px_rgba(0,0,0,0.6)]">
            <LandingHeroCanvas />
            {/* Overlay Banner */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#16191f]/90 backdrop-blur-md border border-[#343d4d] p-3 rounded-[4px] flex items-center justify-between pointer-events-none">
              <div>
                <span className="text-[10px] text-[#ff9900] font-mono uppercase font-bold">
                  Interactive 3D Preview
                </span>
                <p className="text-[12px] text-white font-medium">Nordic Living Room Simulation</p>
              </div>
              <Badge variant="brand" size="sm">
                Three.js
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: Exactly 3 Feature Breakdown Cards */}
      <section className="px-6 py-14 max-w-7xl mx-auto w-full border-t border-[#232b37]">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="brand" size="sm">
            Core Architecture
          </Badge>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-white">How ArchiTech Works</h2>
          <p className="text-[14px] text-[#8c8c94]">
            Three integrated steps uniting computer vision, spatial reasoning, and real-time 3D synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.number}
                variant="interactive"
                className="p-6 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[28px] font-bold text-[#232b37] group-hover:text-[#ff9900]/40 transition-colors font-mono">
                      {feat.number}
                    </span>
                    <div className="w-10 h-10 rounded-[4px] bg-[#232b37] flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <Badge variant="neutral" size="sm" className="mb-2">
                      {feat.tag}
                    </Badge>
                    <h3 className="text-[18px] font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-[13px] text-[#8c8c94] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#232b37] flex flex-col gap-1 text-[12px]">
                  <span className="text-[#00e582] font-mono font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {feat.metric}
                  </span>
                  <span className="text-[#687078] text-[11px]">{feat.detail}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Technical Foundations & Integration Stack Banner */}
      <section className="bg-[#0f141a] border-t border-[#232b37] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[#ff9900]" />
            <div>
              <span className="text-[13px] font-bold text-white block">
                Validated Deep Learning Stack
              </span>
              <span className="text-[11px] text-[#8c8c94]">
                Tested on Google Colab NVIDIA Tesla T4 GPU
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {techBadges.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#1b222d] border border-[#232b37] px-3 py-1 rounded-[4px] text-[11px] flex items-center gap-2"
              >
                <span className="text-[#687078] font-mono">{item.category}:</span>
                <span className="text-white font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
