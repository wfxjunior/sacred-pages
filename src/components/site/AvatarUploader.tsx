import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { AVATAR_ACCEPT, AVATAR_MAX_BYTES, removeAvatar, uploadAvatar } from "@/lib/auth/avatar";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

// The profile photo, editable in place. Hiding the input behind the avatar
// keeps the header calm: the whole circle is the affordance.

export function AvatarUploader({
  userId,
  initial,
  avatarUrl,
  avatarPath,
  onChanged,
  size = 64,
}: {
  userId: string | null;
  initial: string;
  avatarUrl: string | null;
  avatarPath: string | null;
  onChanged: () => void;
  size?: number;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const editable = Boolean(userId);

  async function handleFile(file: File | undefined) {
    if (!file || !userId) return;
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error(t("profile.avatar.tooLarge"));
      return;
    }
    setBusy(true);
    try {
      await uploadAvatar(userId, file);
      onChanged();
      toast.success(t("profile.avatar.updated"));
    } catch {
      toast.error(t("profile.avatar.failed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!userId) return;
    setBusy(true);
    try {
      await removeAvatar(userId, avatarPath);
      onChanged();
    } catch {
      toast.error(t("profile.avatar.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        disabled={!editable || busy}
        onClick={() => inputRef.current?.click()}
        aria-label={t("profile.avatar.change")}
        className="group relative grid place-items-center overflow-hidden rounded-full font-serif text-xl text-white outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] disabled:cursor-default"
        style={{
          width: size,
          height: size,
          background: avatarUrl ? "var(--surface-2)" : "linear-gradient(135deg, var(--gold), var(--walnut))",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={t("profile.avatar.alt")} className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
        {editable && (
          <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </span>
        )}
        {busy && !avatarUrl && (
          <span className="absolute inset-0 grid place-items-center bg-black/45">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
      </button>

      {editable && avatarPath && !busy && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label={t("profile.avatar.remove")}
          className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
