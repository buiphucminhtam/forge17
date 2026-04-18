/**
 * PipelineMonitor - Displays pipeline execution progress
 *
 * Features:
 * - Phase timeline with expandable skills
 * - Real-time status updates
 * - Duration and error display
 */

import React, { useState } from "react";
import { Phase, Skill } from "../../types/studio.js";

interface PipelineMonitorProps {
  phases: Phase[];
  isRunning: boolean;
}

const STATUS_COLORS = {
  pending: "bg-gray-300",
  running: "bg-blue-500 animate-pulse",
  complete: "bg-green-500",
  error: "bg-red-500",
};

const STATUS_ICONS = {
  pending: "○",
  running: "◐",
  complete: "●",
  error: "✕",
};

export function PipelineMonitor({ phases, isRunning }: PipelineMonitorProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  if (phases.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <div className="text-4xl mb-2">📊</div>
        <p>No pipeline activity</p>
        <p className="text-sm mt-1">
          Start a pipeline to see real-time progress
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Pipeline Progress</h2>
        {isRunning && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Running
          </span>
        )}
      </div>

      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${STATUS_COLORS[phase.status]}`}
                />
                <span className="text-gray-400 text-sm">{index + 1}</span>
                <span className="font-medium">{phase.name}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {phase.progress}%
                </span>
                <span className="text-gray-400">
                  {expandedPhases.has(phase.id) ? "▼" : "▶"}
                </span>
              </div>
            </button>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
              <div
                className={`h-full transition-all duration-300 ${STATUS_COLORS[phase.status]}`}
                style={{ width: `${phase.progress}%` }}
              />
            </div>

            {/* Skills (Expanded) */}
            {expandedPhases.has(phase.id) && phase.skills.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <div className="space-y-2">
                  {phase.skills.map((skill) => (
                    <SkillItem key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillItem({ skill }: { skill: Skill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-start gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-gray-400 hover:text-gray-600"
      >
        <span
          className={`text-sm ${STATUS_COLORS[skill.status] === "bg-blue-500 animate-pulse" ? "animate-spin" : ""}`}
        >
          {STATUS_ICONS[skill.status]}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{skill.name}</span>
          <span className="text-xs text-gray-500">{skill.progress}%</span>
        </div>

        {skill.message && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {skill.message}
          </p>
        )}

        {expanded && skill.message && (
          <p className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border">
            {skill.message}
          </p>
        )}
      </div>
    </div>
  );
}
