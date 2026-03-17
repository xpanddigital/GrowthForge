"use client";

import { useState } from "react";

interface AlertConfigFormProps {
  clientId: string;
  existingAlert?: {
    id: string;
    alert_type: string;
    threshold_value: number;
    threshold_direction: string;
    is_active: boolean;
  };
  onSave: (config: {
    alert_type: string;
    threshold_value: number;
    threshold_direction: string;
  }) => void;
  onCancel: () => void;
}

const ALERT_TYPES = [
  { value: "som_drop", label: "Share of Model Drop", description: "Alert when SoM drops below threshold" },
  { value: "som_rise", label: "Share of Model Rise", description: "Alert when SoM rises above threshold" },
  { value: "visibility_drop", label: "Visibility Score Drop", description: "Alert when AI Visibility Score drops" },
  { value: "new_competitor", label: "New Competitor Detected", description: "Alert when a new competitor appears in AI responses" },
  { value: "brand_mentioned", label: "Brand First Mentioned", description: "Alert when brand is mentioned for the first time by a model" },
  { value: "response_change", label: "Response Changed", description: "Alert when an AI model's response hash changes" },
];

export function AlertConfigForm({ existingAlert, onSave, onCancel }: AlertConfigFormProps) {
  const [alertType, setAlertType] = useState(existingAlert?.alert_type || "som_drop");
  const [thresholdValue, setThresholdValue] = useState(existingAlert?.threshold_value || 10);
  const [thresholdDirection, setThresholdDirection] = useState(existingAlert?.threshold_direction || "below");

  const selectedType = ALERT_TYPES.find((t) => t.value === alertType);
  const needsThreshold = ["som_drop", "som_rise", "visibility_drop"].includes(alertType);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-medium text-foreground">
        {existingAlert ? "Edit Alert Rule" : "Create Alert Rule"}
      </h3>

      {/* Alert type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Alert Type</label>
        <select
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {ALERT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedType && (
          <p className="text-xs text-muted-foreground">{selectedType.description}</p>
        )}
      </div>

      {/* Threshold */}
      {needsThreshold && (
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Direction</label>
            <select
              value={thresholdDirection}
              onChange={(e) => setThresholdDirection(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="below">Drops below</option>
              <option value="above">Rises above</option>
              <option value="change">Changes by</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {thresholdDirection === "change" ? "Change %" : "Threshold"}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={thresholdValue}
              onChange={(e) => setThresholdValue(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ alert_type: alertType, threshold_value: thresholdValue, threshold_direction: thresholdDirection })}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {existingAlert ? "Update" : "Create"} Alert
        </button>
      </div>
    </div>
  );
}
