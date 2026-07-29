import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WorkflowActions } from "@/components/admin/WorkflowActions";
import { CollectionForm, type CollectionFormValues } from "@/components/admin/CollectionForm";
import type { SaveStatus } from "@/components/admin/SaveState";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCollections } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { isAppError } from "@/lib/errors";
import type { AccessLevel } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

export const Route = createFileRoute("/admin/collections/$collectionId")({
  head: () => ({
    meta: [
      { title: "Edit collection — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditCollection,
});

function EditCollection() {
  const { collectionId } = Route.useParams();
  const session = useAdminSession();
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const collection = useQuery({
    queryKey: ["admin", "collection", collectionId],
    queryFn: () => adminCollections.getById(collectionId),
    enabled: session.status === "ready",
  });

  const save = useMutation({
    mutationFn: async (values: CollectionFormValues) => {
      await adminCollections.update(collectionId, {
        internalName: values.internalName,
        slug: values.slug,
        accessLevel: values.accessLevel,
        topic: values.topic || undefined,
        audience: values.audience || undefined,
        estimatedTotalMinutes: values.estimatedTotalMinutes
          ? Number(values.estimatedTotalMinutes)
          : undefined,
        displayOrder: Number(values.displayOrder || 0),
        isFeatured: values.isFeatured,
      });

      await adminCollections.upsertTranslation({
        collectionId,
        languageCode: values.primaryLanguageCode,
        status: "draft",
        title: values.title,
        shortDescription: values.shortDescription || undefined,
        fullDescription: values.fullDescription || undefined,
      });
    },
    onMutate: () => {
      setSaveStatus("saving");
      setSaveError(null);
    },
    onSuccess: async () => {
      setSaveStatus("saved");
      await queryClient.invalidateQueries({ queryKey: ["admin", "collection", collectionId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not save this collection");
    },
  });

  if (collection.isPending) {
    return (
      <AdminShell title="Collection">
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminShell>
    );
  }

  if (collection.isError || !collection.data) {
    return (
      <AdminShell title="Collection">
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Could not load this collection.
        </p>
      </AdminShell>
    );
  }

  const data = collection.data;
  const primary =
    data.collection_translations.find((t) => t.language_code === data.primary_language_code) ??
    data.collection_translations[0];

  const initialValues: CollectionFormValues = {
    internalName: data.internal_name,
    slug: data.slug,
    primaryLanguageCode: data.primary_language_code as Locale,
    accessLevel: data.access_level as AccessLevel,
    topic: data.topic ?? "",
    audience: data.audience ?? "",
    difficultyMin: data.difficulty_min ?? "",
    difficultyMax: data.difficulty_max ?? "",
    estimatedTotalMinutes: data.estimated_total_minutes ? String(data.estimated_total_minutes) : "",
    displayOrder: String(data.display_order),
    isFeatured: data.is_featured,
    title: primary?.title ?? "",
    shortDescription: primary?.short_description ?? "",
    fullDescription: primary?.full_description ?? "",
  };

  return (
    <AdminShell
      title={data.internal_name}
      description={`/${data.slug}`}
      actions={
        <>
          <StatusBadge status={data.status} />
          <WorkflowActions
            entityType="collection"
            entityId={data.id}
            status={data.status}
            createdBy={data.created_by}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: ["admin", "collection", collectionId] })
            }
          />
        </>
      }
    >
      <div className="max-w-3xl">
        <CollectionForm
          key={data.id}
          initialValues={initialValues}
          saveStatus={saveStatus}
          saveError={saveError}
          submitLabel="Save changes"
          onSubmit={(values) => save.mutate(values)}
        />
      </div>
    </AdminShell>
  );
}
