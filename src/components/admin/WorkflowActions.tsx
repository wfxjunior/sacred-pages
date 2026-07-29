import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminWorkflow } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { canTransition } from "@/lib/content/status";
import type { ContentStatus } from "@/lib/content/types";
import { isAppError } from "@/lib/errors";

// Workflow buttons.
//
// Only transitions the actor may actually perform are offered — but the
// database trigger enforces the same rules independently, so a user who calls
// the API directly still cannot approve their own work or skip review.

const TRANSITION_LABELS: Partial<Record<ContentStatus, string>> = {
  in_review: "Submit for review",
  approved: "Approve",
  changes_requested: "Request changes",
  published: "Publish",
  unpublished: "Unpublish",
  archived: "Archive",
  draft: "Return to draft",
  scheduled: "Schedule",
};

const NOTE_REQUIRED: ContentStatus[] = ["changes_requested"];

export function WorkflowActions({
  entityType,
  entityId,
  status,
  createdBy,
  onChanged,
}: {
  entityType: "collection" | "journey";
  entityId: string;
  status: ContentStatus;
  createdBy: string | null;
  onChanged: () => void;
}) {
  const session = useAdminSession();
  const [pendingStatus, setPendingStatus] = useState<ContentStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const available = (Object.keys(TRANSITION_LABELS) as ContentStatus[]).filter((target) => {
    const result = canTransition({
      from: status,
      to: target,
      capabilities: session.capabilities,
      actorId: session.userId,
      contentCreatedBy: createdBy,
    });
    return result.allowed;
  });

  const transition = useMutation({
    mutationFn: async (target: ContentStatus) => {
      if (notes.trim() && session.userId) {
        await adminWorkflow.submitReview({
          entityType,
          entityId,
          decision:
            target === "approved"
              ? "approved"
              : target === "changes_requested"
                ? "changes_requested"
                : "submitted",
          notes: notes.trim(),
          actorId: session.userId,
        });
      }
      await adminWorkflow.transition({
        entityType,
        entityId,
        from: status,
        to: target,
        capabilities: session.capabilities,
        actorId: session.userId,
        contentCreatedBy: createdBy,
      });
    },
    onSuccess: () => {
      setPendingStatus(null);
      setNotes("");
      setError(null);
      onChanged();
    },
    onError: (err) => {
      setError(isAppError(err) ? err.message : "Could not complete this action");
    },
  });

  if (available.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {available.map((target) => (
          <Button
            key={target}
            size="sm"
            variant={target === "published" ? "default" : "outline"}
            onClick={() => {
              setError(null);
              setNotes("");
              setPendingStatus(target);
            }}
          >
            {TRANSITION_LABELS[target]}
          </Button>
        ))}
      </div>

      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => !open && setPendingStatus(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingStatus ? TRANSITION_LABELS[pendingStatus] : "Change status"}
            </DialogTitle>
            <DialogDescription>
              {pendingStatus === "published"
                ? "This makes the content visible to readers immediately."
                : pendingStatus === "changes_requested"
                  ? "Explain what needs to change. The author will see your note."
                  : "This action is recorded in the audit log."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="workflow-notes" className="text-sm font-medium">
              Notes
              {pendingStatus && NOTE_REQUIRED.includes(pendingStatus) ? (
                <span aria-hidden style={{ color: "#B4542F" }}>
                  {" "}
                  *
                </span>
              ) : (
                <span className="text-muted-foreground"> (optional)</span>
              )}
            </label>
            <Textarea
              id="workflow-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm" style={{ color: "#B4542F" }}>
              {error}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                transition.isPending ||
                (pendingStatus !== null &&
                  NOTE_REQUIRED.includes(pendingStatus) &&
                  notes.trim().length === 0)
              }
              onClick={() => pendingStatus && transition.mutate(pendingStatus)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
