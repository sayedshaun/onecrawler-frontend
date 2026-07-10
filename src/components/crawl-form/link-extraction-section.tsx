import { Field, FieldRow } from "@/components/crawl-form/field";
import { PatternListInput } from "@/components/crawl-form/pattern-list-input";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CrawlSettings } from "@/lib/types";

export function LinkExtractionSection({
  settings,
  onChange,
  showStrategy = true,
  limitLabel = "Link / URL limit",
  limitDescription = "Hard cap on collected links. Always set this for broad sites.",
}: {
  settings: CrawlSettings;
  onChange: (patch: Partial<CrawlSettings>) => void;
  /** Crawler mode never reads link_extraction_strategy (it always runs a single
   * orchestrated pass) — only Link Extraction mode branches on shallow/deep. */
  showStrategy?: boolean;
  limitLabel?: string;
  limitDescription?: string;
}) {
  const limitField = (
    <Field label={limitLabel} description={limitDescription}>
      <Input
        type="number"
        min={1}
        value={settings.linkExtractionLimit}
        onChange={(e) => onChange({ linkExtractionLimit: Number(e.target.value) || 0 })}
      />
    </Field>
  );

  return (
    <div className="space-y-5">
      {showStrategy ? (
        <FieldRow>
          <Field
            label="Discovery strategy"
            description="Deep follows internal links recursively; shallow reads only the starting page."
          >
            <Select
              value={settings.linkExtractionStrategy}
              onValueChange={(v) => onChange({ linkExtractionStrategy: v as CrawlSettings["linkExtractionStrategy"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep">Deep</SelectItem>
                <SelectItem value="shallow">Shallow</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {limitField}
        </FieldRow>
      ) : (
        limitField
      )}

      <Field
        label="Include patterns"
        description={'Allow-list wildcard paths, e.g. "/blog/*". Leave empty to include everything.'}
      >
        <PatternListInput
          values={settings.includeLinkPatterns}
          onChange={(next) => onChange({ includeLinkPatterns: next })}
          placeholder="/news/*"
        />
      </Field>

      <Field label="Exclude patterns" description={'Deny-list wildcard paths, e.g. "/admin/*".'}>
        <PatternListInput
          values={settings.excludeLinkPatterns}
          onChange={(next) => onChange({ excludeLinkPatterns: next })}
          placeholder="/admin/*"
        />
      </Field>
    </div>
  );
}
