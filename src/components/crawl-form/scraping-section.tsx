import { Field, FieldRow } from "@/components/crawl-form/field";
import { GenAISection } from "@/components/crawl-form/genai-section";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CrawlSettings, GenerativeAISettings } from "@/lib/types";

const DEFAULT_GENAI: GenerativeAISettings = {
  provider: "openai",
  modelName: "gpt-4o-mini",
  apiKey: "",
  schemaFields: [],
};

export function ScrapingSection({
  settings,
  onChange,
}: {
  settings: CrawlSettings;
  onChange: (patch: Partial<CrawlSettings>) => void;
}) {
  const isGenAI = settings.scrapingStrategy === "genai";

  function setStrategy(strategy: CrawlSettings["scrapingStrategy"]) {
    if (strategy === "genai") {
      onChange({
        scrapingStrategy: strategy,
        scrapingOutputFormat: "json",
        genai: settings.genai ?? DEFAULT_GENAI,
      });
    } else {
      onChange({ scrapingStrategy: strategy });
    }
  }

  return (
    <div className="space-y-5">
      <FieldRow>
        <Field label="Extraction strategy" description="Heuristic is fast and deterministic; GenAI produces typed output.">
          <Select value={settings.scrapingStrategy} onValueChange={(v) => setStrategy(v as CrawlSettings["scrapingStrategy"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heuristic">Heuristic</SelectItem>
              <SelectItem value="genai">GenAI</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Output format"
          description={isGenAI ? "GenAI extraction only supports JSON output." : undefined}
        >
          <Select
            value={settings.scrapingOutputFormat}
            disabled={isGenAI}
            onValueChange={(v) => onChange({ scrapingOutputFormat: v as CrawlSettings["scrapingOutputFormat"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="xmltei">XML-TEI</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Concurrency" description="Number of async workers.">
          <Input
            type="number"
            min={1}
            value={settings.concurrency}
            onChange={(e) => onChange({ concurrency: Number(e.target.value) || 1 })}
          />
        </Field>
        <Field label="Request timeout (s)">
          <Input
            type="number"
            min={1}
            value={settings.requestTimeout}
            onChange={(e) => onChange({ requestTimeout: Number(e.target.value) || 1 })}
          />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Max retries">
          <Input
            type="number"
            min={0}
            value={settings.maxRetries}
            onChange={(e) => onChange({ maxRetries: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Retry delay (s)">
          <Input
            type="number"
            min={0}
            value={settings.retryDelay}
            onChange={(e) => onChange({ retryDelay: Number(e.target.value) || 0 })}
          />
        </Field>
      </FieldRow>

      {isGenAI && settings.genai && (
        <GenAISection
          genai={settings.genai}
          onChange={(patch) => onChange({ genai: { ...settings.genai!, ...patch } })}
        />
      )}
    </div>
  );
}
