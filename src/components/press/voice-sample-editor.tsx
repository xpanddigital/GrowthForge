"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VoiceSample {
  quote: string;
  context: string;
  date: string;
}

interface VoiceSampleEditorProps {
  samples: VoiceSample[];
  onChange: (samples: VoiceSample[]) => void;
}

export function VoiceSampleEditor({ samples, onChange }: VoiceSampleEditorProps) {
  function addSample() {
    onChange([...samples, { quote: "", context: "", date: "" }]);
  }

  function removeSample(index: number) {
    onChange(samples.filter((_, i) => i !== index));
  }

  function updateSample(index: number, field: keyof VoiceSample, value: string) {
    onChange(
      samples.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          Voice Samples ({samples.length}/3 minimum)
        </Label>
        <Button variant="outline" size="sm" onClick={addSample}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Sample
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Provide quotes from articles, interviews, or speeches. These train the AI to write in this person&apos;s voice.
      </p>
      {samples.map((sample, index) => (
        <div key={index} className="rounded-md border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Sample {index + 1}
            </span>
            <button
              onClick={() => removeSample(index)}
              className="rounded p-1 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <Textarea
            placeholder="Paste a quote or excerpt..."
            value={sample.quote}
            onChange={(e) => updateSample(index, "quote", e.target.value)}
            rows={3}
            className="text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Context (e.g., interview with Forbes)"
              value={sample.context}
              onChange={(e) => updateSample(index, "context", e.target.value)}
              className="text-sm"
            />
            <Input
              type="date"
              value={sample.date}
              onChange={(e) => updateSample(index, "date", e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      ))}
      {samples.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No voice samples yet. Add at least 3 samples to enable voice modeling.
        </div>
      )}
    </div>
  );
}
