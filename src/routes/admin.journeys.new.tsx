import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormErrorSummary, FormField } from "@/components/admin/FormField";
import { SaveState, type SaveStatus } from "@/components/admin/SaveState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCollections, adminJourneys } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { slugify } from "@/lib/content/slug";
import { journeyCreateSchema } from "@/lib/content/schemas";
import { ACCESS_LEVELS, DIFFICULTY_LEVELS } from "@/lib/content/types";
import { LOCALES } from "@/lib/i18n";
import { isAppError } from "@/lib/errors";

export const Route = createFileRoute("/admin/journeys/new")({
  head: () => ({
    meta: [
      { title: "New journey — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewJourney,
});

function NewJourney() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useAdminSession();

  const [internalTitle, setInternalTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [publicTitle, setPublicTitle] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [language, setLanguage] = useState<"en" | "pt" | "es">("en");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTY_LEVELS)[number]>("gentle");
  const [accessLevel, setAccessLevel] = useState<(typeof ACCESS_LEVELS)[number]>("free");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const collections = useQuery({
    queryKey: ["admin", "collections", "picker"],
    queryFn: () => adminCollections.list({ limit: 200 }),
    enabled: session.status === "ready",
  });

  const create = useMutation({
    mutationFn: async () => {
      const journey = await adminJourneys.create({
        internalTitle,
        slug,
        primaryCollectionId: collectionId,
        primaryLanguageCode: language,
        position: 0,
        accessLevel,
        difficulty,
        estimatedMinutes: 7,
        isFeatured: false,
        dailyEligible: true,
      });

      // Create the primary translation and default puzzle settings together so
      // the journey opens in a usable state rather than half-configured.
      await adminJourneys.upsertTranslation({
        journeyId: journey.id,
        languageCode: language,
        status: "draft",
        publicTitle: publicTitle || internalTitle,
      });
      await adminJourneys.createDefaultPuzzleTemplate({
        journeyId: journey.id,
        languageCode: language,
        difficulty,
      });

      return journey;
    },
    onMutate: () => {
      setSaveStatus("saving");
      setSaveError(null);
    },
    onSuccess: async (journey) => {
      setSaveStatus("saved");
      await queryClient.invalidateQueries({ queryKey: ["admin", "journeys"] });
      void navigate({ to: "/admin/journeys/$journeyId", params: { journeyId: journey.id } });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not create this journey");
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = journeyCreateSchema.safeParse({
      internalTitle,
      slug,
      primaryCollectionId: collectionId,
      primaryLanguageCode: language,
      accessLevel,
      difficulty,
    });

    const fieldErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    create.mutate();
  }

  return (
    <AdminShell
      title="New journey"
      description="Start with the essentials. Scripture, devotional, words and puzzle settings come next."
    >
      <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-8">
        <FormErrorSummary errors={errors} />

        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <FormField
            id="internalTitle"
            label="Internal title"
            hint="Staff-facing working title."
            error={errors.internalTitle}
            required
          >
            {(props) => (
              <Input
                {...props}
                value={internalTitle}
                onChange={(e) => {
                  setInternalTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            )}
          </FormField>

          <FormField id="publicTitle" label="Public title" hint="Shown to readers.">
            {(props) => (
              <Input
                {...props}
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                placeholder={internalTitle || "Gratitude That Transforms"}
              />
            )}
          </FormField>

          <FormField id="slug" label="Slug" error={errors.slug} required>
            {(props) => (
              <Input
                {...props}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            )}
          </FormField>

          <FormField
            id="primaryCollectionId"
            label="Primary collection"
            hint="Every journey belongs to exactly one primary collection."
            error={errors.primaryCollectionId}
            required
          >
            {(props) => (
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger id={props.id} aria-describedby={props["aria-describedby"]}>
                  <SelectValue placeholder={collections.isPending ? "Loading…" : "Choose one"} />
                </SelectTrigger>
                <SelectContent>
                  {(collections.data?.items ?? []).map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.internal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField id="language" label="Language">
              {(props) => (
                <Select
                  value={language}
                  onValueChange={(v) => setLanguage(v as "en" | "pt" | "es")}
                >
                  <SelectTrigger id={props.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <FormField id="difficulty" label="Difficulty">
              {(props) => (
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as (typeof DIFFICULTY_LEVELS)[number])}
                >
                  <SelectTrigger id={props.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <FormField id="accessLevel" label="Access">
              {(props) => (
                <Select
                  value={accessLevel}
                  onValueChange={(v) => setAccessLevel(v as (typeof ACCESS_LEVELS)[number])}
                >
                  <SelectTrigger id={props.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={create.isPending} aria-busy={create.isPending}>
            Create journey
          </Button>
          <SaveState status={saveStatus} error={saveError} />
        </div>
      </form>
    </AdminShell>
  );
}
