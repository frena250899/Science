import React from 'react';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { TrendingUp, HelpCircle } from 'lucide-react';

interface DistanceTimeGraphProps {
  distance: number; // in meters (y-axis)
  time: number; // in seconds (x-axis)
  currentProgress?: number; // 0 to 1
  language: Language;
}

export const DistanceTimeGraph: React.FC<DistanceTimeGraphProps> = ({
  distance,
  time,
  currentProgress = 1,
  language
}) => {
  const t = TRANSLATIONS[language];
  const speed = Math.round((distance / time) * 100) / 100;

  // Graph Dimensions
  const width = 360;
  const height = 220;
  const padLeft = 46;
  const padBottom = 36;
  const padTop = 20;
  const padRight = 20;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Max bounds with breathing room
  const maxX = Math.ceil(time * 1.25);
  const maxY = Math.ceil(distance * 1.2);

  // Coordinate scales
  const scaleX = (val: number) => padLeft + (val / maxX) * plotWidth;
  const scaleY = (val: number) => height - padBottom - (val / maxY) * plotHeight;

  // Current animated point
  const currentDist = distance * currentProgress;
  const currentTime = time * currentProgress;

  const startPoint = { x: scaleX(0), y: scaleY(0) };
  const currentPoint = { x: scaleX(currentTime), y: scaleY(currentDist) };
  const targetPoint = { x: scaleX(time), y: scaleY(distance) };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            {t.graphTitle}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          Slope = {speed} m/s
        </span>
      </div>

      {/* SVG Coordinate Graph */}
      <div className="relative flex justify-center select-none overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[400px] h-auto">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct) => {
            const yVal = maxY * pct;
            const xVal = maxX * pct;
            return (
              <g key={pct} opacity="0.3">
                <line
                  x1={padLeft}
                  y1={scaleY(yVal)}
                  x2={width - padRight}
                  y2={scaleY(yVal)}
                  stroke="#94A3B8"
                  strokeDasharray="2,2"
                />
                <line
                  x1={scaleX(xVal)}
                  y1={padTop}
                  x2={scaleX(xVal)}
                  y2={height - padBottom}
                  stroke="#94A3B8"
                  strokeDasharray="2,2"
                />
              </g>
            );
          })}

          {/* Coordinate Axes */}
          {/* Y Axis (Distance) */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#1E293B"
            strokeWidth="2"
          />
          {/* X Axis (Time) */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#1E293B"
            strokeWidth="2"
          />

          {/* Axis Labels */}
          <text
            x={width / 2 + 10}
            y={height - 8}
            textAnchor="middle"
            className="text-[10px] font-sans font-medium fill-slate-600"
          >
            {t.timeAxis}
          </text>
          <text
            x={14}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 14, ${height / 2})`}
            className="text-[10px] font-sans font-medium fill-slate-600"
          >
            {t.distanceAxis}
          </text>

          {/* Key tick labels */}
          <text
            x={padLeft - 6}
            y={scaleY(distance) + 3}
            textAnchor="end"
            className="text-[10px] font-mono font-bold fill-blue-700"
          >
            {distance}m
          </text>
          <text
            x={scaleX(time)}
            y={height - padBottom + 14}
            textAnchor="middle"
            className="text-[10px] font-mono font-bold fill-blue-700"
          >
            {time}s
          </text>

          {/* Slope Triangle (Rise / Run) */}
          <polygon
            points={`${startPoint.x},${targetPoint.y} ${targetPoint.x},${targetPoint.y} ${startPoint.x},${startPoint.y}`}
            fill="#3B82F6"
            opacity="0.1"
          />

          {/* Target Motion Line (Expected constant velocity) */}
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={targetPoint.x}
            y2={targetPoint.y}
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="4,3"
          />

          {/* Live Progress Motion Line */}
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={currentPoint.x}
            y2={currentPoint.y}
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Moving Data Marker Point */}
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r="5"
            fill="#2563EB"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Target Finish Point */}
          <circle
            cx={targetPoint.x}
            cy={targetPoint.y}
            r="4"
            fill="#10B981"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Physics Concept Note */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">{t.slopeIsSpeed}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'id'
              ? 'Garis yang lebih tegak/curam berarti kelajuan lebih tinggi. Garis datar berarti benda diam.'
              : 'A steeper slope indicates higher speed. A flat horizontal line means the object is at rest.'}
          </p>
        </div>
      </div>
    </div>
  );
};
