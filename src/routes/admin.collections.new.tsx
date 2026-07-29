import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  CollectionForm,
  EMPTY_COLLECTION,
  type CollectionFormValues,
} from "@/components/admin/CollectionForm";
import type { SaveStatus } from "@/components/admin/SaveState";
import { adminCollections } from "@/lib/content/admin-repository";
import { isAppError } from "@/lib/errors";

export const Route = createFileRoute("/admin/collections/new")({
  head: () => ({
    meta: [
      { title: "New collection — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewCollection,
});

function NewCollection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async (values: CollectionFormValues) => {
      const collection = await adminCollections.create({
        internalName: values.internalName,
        slug: values.slug,
        primaryLanguageCode: values.primaryLanguageCode,
        accessLevel: values.accessLevel,
        topic: values.topic || undefined,
        audience: values.audience || undefined,
        difficultyMin: values.difficultyMin
          ? (values.difficultyMin as CollectionFormValues["difficultyMin"] & "gentle")
          : undefined,
        difficultyMax: values.difficultyMax
          ? (values.difficultyMax as CollectionFormValues["difficultyMax"] & "gentle")
          : undefined,
        estimatedTotalMinutes: values.estimatedTotalMinutes
          ? Number(values.estimatedTotalMinutes)
          : undefined,
        displayOrder: Number(values.displayOrder || 0),
        isFeatured: values.isFeatured,
      });

      // The collection and its primary-language translation are created
      // together so a new collection is never left without a title.
      await adminCollections.upsertTranslation({
        collectionId: collection.id,
        languageCode: values.primaryLanguageCode,
        status: "draft",
        title: values.title,
        shortDescription: values.shortDescription || undefined,
        fullDescription: values.fullDescription || undefined,
      });

      return collection;
    },
    onMutate: () => {
      setSaveStatus("saving");
      setSaveError(null);
    },
    onSuccess: async (collection) => {
      setSaveStatus("saved");
      await queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      void navigate({
        to: "/admin/collections/$collectionId",
        params: { collectionId: collection.id },
      });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not create this collection");
    },
  });

  return (
    <AdminShell
      title="New collection"
      description="Collections group journeys around a book, person or theme."
    >
      <div className="max-w-3xl">
        <CollectionForm
          initialValues={EMPTY_COLLECTION}
          saveStatus={saveStatus}
          saveError={saveError}
          submitLabel="Create collection"
          onSubmit={(values) => create.mutate(values)}
        />
      </div>
    </AdminShell>
  );
}
