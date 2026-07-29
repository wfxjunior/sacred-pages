import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Archive, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminJourneys } from "@/lib/content/admin-repository";
import { puzzleTemplateService } from "@/lib/puzzle/services";
import { toCategories } from "@/lib/puzzle/grid";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { isAppError } from "@/lib/errors";
import type { PuzzleTemplateRow } from "@/lib/puzzle/rows";

export const Route = createFileRoute("/admin/templates")({
  head: () => ({
    meta: [
      { title: "Puzzle templates — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PuzzleTemplates,
});

const STATUS_LABEL: Record<PuzzleTemplateRow["status"], string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

function PuzzleTemplates() {
  const session = useAdminSession();
  const queryClient = useQueryClient();
  const [journeyId, setJourneyId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const journeys = useQuery({
    queryKey: ["admin", "journeys", "template-picker"],
    queryFn: () => adminJourneys.list({ limit: 200 }),
    enabled: session.status === "ready",
  });

  const templates = useQuery({
    queryKey: ["admin", "puzzle-templates", journeyId],
    queryFn: () => puzzleTemplateService.listForJourney(journeyId),
    enabled: session.status === "ready" && journeyId.length > 0,
  });

  function runAction(action: () => Promise<unknown>) {
    setError(null);
    return action()
      .then(() => queryClient.invalidateQueries({ queryKey: ["admin", "puzzle-templates"] }))
      .catch((err: unknown) =>
        setError(isAppError(err) ? err.message : "Could not complete this action"),
      );
  }

  const duplicate = useMutation({
    mutationFn: (id: string) => runAction(() => puzzleTemplateService.duplicate(id)),
  });
  const activate = useMutation({
    mutationFn: (id: string) => runAction(() => puzzleTemplateService.activate(id)),
  });
  const archive = useMutation({
    mutationFn: (id: string) => runAction(() => puzzleTemplateService.archive(id)),
  });

  return (
    <AdminShell
      title="Puzzle templates"
      description="A template is the recipe for generating a puzzle: journey, language, difficulty and version."
    >
      <div className="space-y-6">
        <p className="rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
          Editing a template that has already generated puzzles creates a new version instead of
          changing it, so puzzles readers have already seen keep reproducing exactly.
        </p>

        <div className="max-w-md">
          <label htmlFor="journey-picker" className="text-sm font-medium">
            Journey
          </label>
          <div className="mt-1.5">
            <Select value={journeyId} onValueChange={setJourneyId}>
              <SelectTrigger id="journey-picker">
                <SelectValue placeholder={journeys.isPending ? "Loading…" : "Choose a journey"} />
              </SelectTrigger>
              <SelectContent>
                {(journeys.data?.items ?? []).map((journey) => (
                  <SelectItem key={journey.id} value={journey.id}>
                    {journey.internal_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border p-4 text-sm"
            style={{
              borderColor: "color-mix(in oklab, #B4542F 40%, transparent)",
              color: "#B4542F",
            }}
          >
            {error}
          </p>
        )}

        {!journeyId ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Choose a journey to see its puzzle templates.
          </p>
        ) : templates.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : (templates.data?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="font-serif text-lg">No templates yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Templates are created from the journey editor&rsquo;s Puzzle tab.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-5">
              <Link to="/admin/journeys/$journeyId" params={{ journeyId }}>
                Open journey editor
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Puzzle templates for the selected journey</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Locale / difficulty
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Version
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">
                    Rules
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {templates.data?.map((template) => (
                  <tr key={template.id} className="transition hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <span className="font-medium uppercase">{template.language_code}</span>
                      <span className="ml-2 capitalize text-muted-foreground">
                        {template.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4 tabular-nums">v{template.version}</td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                        style={{
                          borderColor:
                            template.status === "active"
                              ? "color-mix(in oklab, var(--sage) 45%, transparent)"
                              : "var(--border)",
                          color:
                            template.status === "active"
                              ? "var(--sage)"
                              : "var(--muted-foreground)",
                        }}
                      >
                        {STATUS_LABEL[template.status]}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-xs text-muted-foreground lg:table-cell">
                      {template.min_grid_size}–{template.max_grid_size} grid ·{" "}
                      {template.target_word_count} words ·{" "}
                      {toCategories(
                        template.allowed_directions as Parameters<typeof toCategories>[0],
                      )
                        .map((c) => c.replace(/_/g, " "))
                        .join(", ")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {template.status !== "active" && template.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activate.mutate(template.id)}
                            aria-label={`Activate version ${template.version}`}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                            Activate
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => duplicate.mutate(template.id)}
                          aria-label={`Duplicate version ${template.version}`}
                        >
                          <Copy className="h-4 w-4" aria-hidden />
                        </Button>
                        {template.status !== "archived" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => archive.mutate(template.id)}
                            aria-label={`Archive version ${template.version}`}
                          >
                            <Archive className="h-4 w-4" aria-hidden />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
