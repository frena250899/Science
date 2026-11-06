import React, { useState } from 'react';
import { TEST_VEHICLES } from '../data/modulesData';
import { VehicleConfig, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { SpeedSimulationTrack } from './SpeedSimulationTrack';
import { sound } from '../utils/audio';
import { Sliders, ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react';

interface SandboxModeProps {
  onBackToHub: () => void;
  language?: Language;
}

export const SandboxMode: React.FC<SandboxModeProps> = ({ onBackToHub, language = 'en' }) => {
  const t = TRANSLATIONS[language];
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string>('racecar');
  const [distance, setDistance] = useState<number>(80);
  const [speed, setSpeed] = useState<number>(20);
  const [isRunComplete, setIsRunComplete] = useState<boolean>(false);

  const vehicle: VehicleConfig = TEST_VEHICLES[selectedVehicleKey] || TEST_VEHICLES.racecar;
  // Calculate expected time based on speed = d / t => t = d / speed
  const expectedTime = Math.round((distance / speed) * 100) / 100;

  const handleRunFinished = () => {
    setIsRunComplete(true);
  };

  const handleValuesChange = (newDist: number, newSpd: number) => {
    setDistance(newDist);
    setSpeed(newSpd);
    setIsRunComplete(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Sandbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHub();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back to Topic Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                OPEN LAB EXPLORER
              </span>
              <span className="text-xs text-slate-400">· Grade 7 Kinematics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Speed & Motion Sandbox
            </h1>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            handleValuesChange(80, 20);
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Interactive Simulation Arena */}
      <SpeedSimulationTrack
        vehicle={vehicle}
        distance={distance}
        targetTime={expectedTime}
        onRunFinished={handleRunFinished}
        isRunComplete={isRunComplete}
        language={language}
      />

      {/* Control Panel: Vehicles & Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Vehicle Selector */}
        <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Test Subject:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(TEST_VEHICLES).map((v) => {
              const isSelected = v.id === vehicle.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedVehicleKey(v.id);
                    setIsRunComplete(false);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{v.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500">{v.description}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders: Distance & Speed */}
        <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5 justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Track Distance (d)
              </label>
              <span className="text-base font-mono font-bold text-blue-700 tabular-nums">
                {distance} meters
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={distance}
              onChange={(e) => handleValuesChange(Number(e.target.value), speed)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>20m</span>
              <span>85m</span>
              <span>150m</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Vehicle Speed (v)
              </label>
              <span className="text-base font-mono font-bold text-emerald-700 tabular-nums">
                {speed} m/s
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={speed}
              onChange={(e) => handleValuesChange(distance, Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>5 m/s (Bicycle)</span>
              <span>20 m/s (Car)</span>
              <span>40 m/s (High Speed)</span>
            </div>
          </div>

          {/* Mathematical Proof Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Scientific Relationship:</span>
            </div>
            <p className="text-xs text-slate-600">
              When traveling <strong className="text-slate-900 font-mono">{distance} meters</strong> at <strong className="text-slate-900 font-mono">{speed} m/s</strong>, the time taken will be:
            </p>
            <div className="mt-2 text-sm font-mono font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>t = d ÷ v = {distance} ÷ {speed}</span>
              <span className="text-blue-600 font-bold">= {expectedTime} seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
