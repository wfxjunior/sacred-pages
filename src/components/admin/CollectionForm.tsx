import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveState, useUnsavedChangesWarning, type SaveStatus } from "./SaveState";
import { FormField, FormErrorSummary } from "./FormField";
import { slugify } from "@/lib/content/slug";
import { collectionCreateSchema } from "@/lib/content/schemas";
import { ACCESS_LEVELS, DIFFICULTY_LEVELS } from "@/lib/content/types";
import { LOCALES } from "@/lib/i18n";

export type CollectionFormValues = {
  internalName: string;
  slug: string;
  primaryLanguageCode: "en" | "pt" | "es";
  accessLevel: (typeof ACCESS_LEVELS)[number];
  topic: string;
  audience: string;
  difficultyMin: string;
  difficultyMax: string;
  estimatedTotalMinutes: string;
  displayOrder: string;
  isFeatured: boolean;
  // First-language translation, created alongside the collection.
  title: string;
  shortDescription: string;
  fullDescription: string;
};

export const EMPTY_COLLECTION: CollectionFormValues = {
  internalName: "",
  slug: "",
  primaryLanguageCode: "en",
  accessLevel: "free",
  topic: "",
  audience: "",
  difficultyMin: "",
  difficultyMax: "",
  estimatedTotalMinutes: "",
  displayOrder: "0",
  isFeatured: false,
  title: "",
  shortDescription: "",
  fullDescription: "",
};

export function CollectionForm({
  initialValues,
  saveStatus,
  saveError,
  submitLabel,
  onSubmit,
}: {
  initialValues: CollectionFormValues;
  saveStatus: SaveStatus;
  saveError?: string | null;
  submitLabel: string;
  onSubmit: (values: CollectionFormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(initialValues.slug.length > 0);

  useUnsavedChangesWarning(dirty && saveStatus !== "saving");

  function set<K extends keyof CollectionFormValues>(key: K, value: CollectionFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Derive the slug from the internal name until an editor overrides it.
      if (key === "internalName" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
    setDirty(true);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = collectionCreateSchema.safeParse({
      internalName: values.internalName,
      slug: values.slug,
      primaryLanguageCode: values.primaryLanguageCode,
      accessLevel: values.accessLevel,
      topic: values.topic || undefined,
      audience: values.audience || undefined,
      difficultyMin: values.difficultyMin || undefined,
      difficultyMax: values.difficultyMax || undefined,
      estimatedTotalMinutes: values.estimatedTotalMinutes
        ? Number(values.estimatedTotalMinutes)
        : undefined,
      displayOrder: Number(values.displayOrder || 0),
      isFeatured: values.isFeatured,
    });

    const fieldErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
    }
    if (!values.title.trim()) {
      fieldErrors.title = "A public title is required for the primary language";
    }

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setDirty(false);
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <FormErrorSummary errors={errors} />

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg">Basics</h2>

        <FormField
          id="internalName"
          label="Internal name"
          hint="Staff-facing only. Never shown to readers."
          error={errors.internalName}
          required
        >
          {(props) => (
            <Input
              {...props}
              value={values.internalName}
              onChange={(e) => set("internalName", e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="slug"
          label="Slug"
          hint="Appears in the public URL. Lowercase letters, numbers and hyphens."
          error={errors.slug}
          required
        >
          {(props) => (
            <Input
              {...props}
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          )}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="primaryLanguageCode"
            label="Primary language"
            error={errors.primaryLanguageCode}
          >
            {(props) => (
              <Select
                value={values.primaryLanguageCode}
                onValueChange={(v) => set("primaryLanguageCode", v as "en" | "pt" | "es")}
              >
                <SelectTrigger id={props.id} aria-describedby={props["aria-describedby"]}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((locale) => (
                    <SelectItem key={locale.code} value={locale.code}>
                      {locale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField id="accessLevel" label="Access level" error={errors.accessLevel}>
            {(props) => (
              <Select
                value={values.accessLevel}
                onValueChange={(v) => set("accessLevel", v as (typeof ACCESS_LEVELS)[number])}
              >
                <SelectTrigger id={props.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="capitalize">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg">
          Description
          <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">
            {values.primaryLanguageCode}
          </span>
        </h2>

        <FormField id="title" label="Public title" error={errors.title} required>
          {(props) => (
            <Input {...props} value={values.title} onChange={(e) => set("title", e.target.value)} />
          )}
        </FormField>

        <FormField
          id="shortDescription"
          label="Short description"
          hint="Used on cards and in search results. Up to 300 characters."
          error={errors.shortDescription}
        >
          {(props) => (
            <Textarea
              {...props}
              rows={2}
              maxLength={300}
              value={values.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          )}
        </FormField>

        <FormField id="fullDescription" label="Full description" error={errors.fullDescription}>
          {(props) => (
            <Textarea
              {...props}
              rows={5}
              value={values.fullDescription}
              onChange={(e) => set("fullDescription", e.target.value)}
            />
          )}
        </FormField>
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg">Presentation</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="topic" label="Topic" error={errors.topic}>
            {(props) => (
              <Input
                {...props}
                value={values.topic}
                onChange={(e) => set("topic", e.target.value)}
              />
            )}
          </FormField>

          <FormField id="audience" label="Audience" error={errors.audience}>
            {(props) => (
              <Input
                {...props}
                value={values.audience}
                onChange={(e) => set("audience", e.target.value)}
              />
            )}
          </FormField>

          <FormField id="difficultyMin" label="Difficulty from" error={errors.difficultyMin}>
            {(props) => (
              <Select value={values.difficultyMin} onValueChange={(v) => set("difficultyMin", v)}>
                <SelectTrigger id={props.id}>
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="capitalize">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField id="difficultyMax" label="Difficulty to" error={errors.difficultyMax}>
            {(props) => (
              <Select value={values.difficultyMax} onValueChange={(v) => set("difficultyMax", v)}>
                <SelectTrigger id={props.id}>
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="capitalize">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField
            id="estimatedTotalMinutes"
            label="Estimated total minutes"
            error={errors.estimatedTotalMinutes}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                min={1}
                value={values.estimatedTotalMinutes}
                onChange={(e) => set("estimatedTotalMinutes", e.target.value)}
              />
            )}
          </FormField>

          <FormField id="displayOrder" label="Display order" error={errors.displayOrder}>
            {(props) => (
              <Input
                {...props}
                type="number"
                min={0}
                value={values.displayOrder}
                onChange={(e) => set("displayOrder", e.target.value)}
              />
            )}
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
          <label htmlFor="isFeatured" className="text-sm">
            Featured
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Highlighted on the collections page while within its featured dates.
            </span>
          </label>
          <Switch
            id="isFeatured"
            checked={values.isFeatured}
            onCheckedChange={(checked) => set("isFeatured", checked)}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={saveStatus === "saving"}
          aria-busy={saveStatus === "saving"}
        >
          {submitLabel}
        </Button>
        <SaveState status={dirty ? "unsaved" : saveStatus} error={saveError} />
      </div>
    </form>
  );
}
