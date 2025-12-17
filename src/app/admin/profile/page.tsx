"use client";

import { useCallback, useEffect, useState, useTransition, useRef, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { notifySessionChange } from "@/components/admin/SessionProvider";
import Cropper, { Area, Point } from "react-easy-crop";

const avatarFallback = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=240&radius=50&backgroundColor=b6c3ff`;

import { useUser } from "@/hooks/useUser";

// Reusable localStorage hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const readValue = useCallback((storageKey: string) => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [initialValue]);

  const [storedValue, setStoredValue] = useState<T>(() => readValue(key));

  useEffect(() => {
    setStoredValue(readValue(key));
  }, [key, readValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore
    }
  }, [key, storedValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue((prev) => (value instanceof Function ? value(prev) : value));
  };

  return [storedValue, setValue];
}

const sanitize = (value: string | null | undefined) => value?.trim() || "No especificado";

// --- Helper Functions for Image Cropping ---

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);

  // Calcular bounding box de la imagen rotada
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // Ajustar canvas al bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Trasladar al centro para rotar
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  // Extraer la imagen recortada usando las coordenadas relativas al bounding box
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  // Canvas final redimensionado (max 400x400)
  const maxDimension = 400;
  const finalSize = Math.min(pixelCrop.width, maxDimension);
  
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = finalSize;
  finalCanvas.height = finalSize;
  
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return null;

  // Crear canvas temporal para el recorte full-res
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = pixelCrop.width;
  tempCanvas.height = pixelCrop.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return null;
  
  tempCtx.putImageData(data, 0, 0);

  // Dibujar redimensionado en el canvas final
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";
  finalCtx.drawImage(tempCanvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, finalSize, finalSize);

  // Retornar JPEG optimizado
  return finalCanvas.toDataURL("image/jpeg", 0.85);

}

// --- Main Component ---

export default function AdminProfilePage() {
  const { user: session, isLoading: loading, mutate } = useUser();
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const userStorageKey = session?.username || "guest";

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(false);
    setAvatarDraft(null);
    setTempImgUrl(null);
  }, [userStorageKey]);

  // Avatar states
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [avatarOverride, setAvatarOverride] = useLocalStorage<string | null>(`user_avatar_override:${userStorageKey}`, null);
  const [coverUrl, setCoverUrl] = useLocalStorage<string>(`user_cover:${userStorageKey}`, "");
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Cropping states
  const [isCropping, setIsCropping] = useState(false);
  const [tempImgUrl, setTempImgUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with session data ONLY ONCE or when explicitly needed
  useEffect(() => {
    if (session && !initialized) {
      setDisplayName(session.displayName || session.username);
      setBio(session.bio || "");
      setInitialized(true);
    }
  }, [session, initialized]);

  // Derived avatar for display
  const activeAvatar = avatarDraft || avatarOverride || session?.avatarUrl || (session ? avatarFallback(session.username) : null);

  const handleSave = () => {
    setStatus(null);
    setError(null);
    if (!session) {
      setError("Necesitas iniciar sesión para guardar tu perfil");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatarUrl: avatarDraft ?? session.avatarUrl,
        };
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setError(data?.error || "No se pudo guardar el perfil");
          return;
        }

        // Update local preview and clear draft
        setAvatarDraft(null);
        if (payload.avatarUrl) setAvatarOverride(payload.avatarUrl);
        setStatus("Perfil actualizado correctamente.");
        notifySessionChange();

        // Revalidate SWR data
        await mutate();

      } catch {
        setError("No se pudo guardar el perfil");
      }
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const data = reader.result as string;
        setTempImgUrl(data);
        setIsCropping(true);
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande (máx 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setCoverUrl(src);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const saveCroppedImage = async () => {
    if (!tempImgUrl || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(tempImgUrl, croppedAreaPixels, rotation);
      if (croppedImage) {
        setAvatarDraft(croppedImage);
        setIsCropping(false);
        setTempImgUrl(null);
        // Reset file input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (e) {
      console.error(e);
      setError("Error al recortar la imagen");
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setTempImgUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const copyId = () => {
    if (!session) return;
    navigator.clipboard.writeText(String(session.id)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-8 text-neo-text-primary">
      {/* Vista previa estilo home (una sola) */}
      {session && (
        <section className="relative overflow-visible rounded-3xl border border-neo-border bg-neo-card shadow-glow-card">
          <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-t-3xl">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Portada" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-linear-to-r from-neo-primary/20 via-neo-primary/10 to-transparent" />
            )}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center text-white/90 hover:text-white"
              title="Cambiar portada"
            >
              <Icon library="lucide" name="Camera" className="h-5 w-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]" />
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
          <div className="relative -mt-12 sm:-mt-16 px-4 sm:px-6 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative z-10 h-20 w-20 rounded-full border-2 border-white/70 bg-neo-surface overflow-visible shadow-xl ring-2 ring-white/20">
                <Image
                  src={activeAvatar || avatarFallback(session.username)}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover rounded-full"
                />
                <button
                  onClick={triggerFileInput}
                  className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center text-white/90 hover:text-white"
                  title="Cambiar foto"
                >
                  <Icon library="lucide" name="Camera" className="h-4 w-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]" />
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.16em] text-neo-text-secondary">Perfil</p>
                <h3 className="text-xl font-bold text-neo-text-primary leading-tight">
                  {displayName || session.username}
                </h3>
                <p className="text-sm text-neo-text-secondary max-w-xl">
                  {bio || "Completa tu bio para que otros sepan en qué estás trabajando."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Crop Modal */}
      {isCropping && tempImgUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neo-border bg-neo-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-neo-border p-4">
              <h3 className="text-lg font-semibold text-neo-text-primary">Ajustar Foto</h3>
              <button onClick={cancelCrop} className="text-neo-text-secondary hover:text-neo-text-primary">
                <Icon library="lucide" name="X" className="h-6 w-6" />
              </button>
            </div>

            <div className="relative flex-1 bg-black/50">
              <Cropper
                image={tempImgUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="space-y-4 bg-neo-surface p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neo-text-secondary">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neo-border accent-neo-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neo-text-secondary">
                  <span>Rotación</span>
                  <span>{rotation}°</span>
                </div>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neo-border accent-neo-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={cancelCrop}
                  className="rounded-xl border border-neo-border px-4 py-2 text-sm font-medium text-neo-text-secondary hover:bg-neo-bg hover:text-neo-text-primary"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCroppedImage}
                  className="rounded-xl bg-neo-primary px-6 py-2 text-sm font-medium text-white shadow-lg shadow-neo-primary/20 hover:bg-neo-primary-dark hover:scale-105 transition-transform"
                >
                  Aplicar Recorte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-4xl border border-neo-border bg-neo-card p-5 sm:p-8 shadow-glow-card">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-neo-primary/10 to-transparent blur-3xl lg:block" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neo-text-primary sm:text-3xl">{displayName || session?.username}</h1>
            {session?.role === "admin" && (
              <span className="rounded-full bg-neo-primary/10 px-2 py-0.5 text-xs font-medium text-neo-primary border border-neo-primary/20">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-neo-text-secondary">@{session?.username}</p>
          {bio && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neo-text-secondary/90 whitespace-pre-wrap wrap-break-word">
              {bio}
            </p>
          )}
        </div>

        {status && (
          <div className="relative mt-4 flex items-center gap-2 text-sm text-accent-emerald animate-fade-in">
            <Icon library="lucide" name="CheckCircle" className="h-4 w-4" />
            {status}
          </div>
        )}
        {error && (
          <div className="relative mt-4 flex items-center gap-2 text-sm text-accent-danger animate-fade-in">
            <Icon library="lucide" name="AlertCircle" className="h-4 w-4" />
            {error}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card lg:col-span-2">
          <header>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Datos Personales</p>
            <h2 className="text-lg font-semibold">Editar Información</h2>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              label="Usuario"
              value={sanitize(session?.username)}
              icon={<Icon library="lucide" name="User" className="h-4 w-4 text-neo-primary" />}
              loading={loading}
            />
            <InfoCard
              label="Rol"
              value={session?.role === "admin" ? "Administrador" : "Usuario"}
              icon={<Icon library="lucide" name="ShieldCheck" className="h-4 w-4 text-accent-emerald" />}
              loading={loading}
            />
            <InfoCard
              label="Email"
              value={sanitize(session?.email)}
              icon={<Icon library="lucide" name="Mail" className="h-4 w-4 text-neo-primary" />}
              loading={loading}
            />
            <InfoCard
              label="ID"
              value={session ? `#${session.id}` : "-"}
              icon={<Icon library="lucide" name="KeyRound" className="h-4 w-4 text-neo-primary" />}
              loading={loading}
              action={
                <button
                  className="flex items-center gap-1 text-xs text-neo-primary hover:text-neo-primary-dark transition-colors"
                  onClick={copyId}
                  disabled={!session}
                  title="Copiar ID"
                >
                  {copied ? <Icon library="lucide" name="Check" className="h-4 w-4" /> : <Icon library="lucide" name="Copy" className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <div className="space-y-4 border-t border-neo-border pt-4">
            <div>
              <label className="block text-sm font-medium text-neo-text-secondary">Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neo-border bg-neo-bg px-4 py-2 text-sm text-neo-text-primary focus:border-neo-primary focus:outline-none focus:ring-2 focus:ring-neo-primary/20 transition-all"
                placeholder="Tu nombre público"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neo-text-secondary">Biografía</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neo-border bg-neo-bg px-4 py-2 text-sm text-neo-text-primary focus:border-neo-primary focus:outline-none focus:ring-2 focus:ring-neo-primary/20 transition-all"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleSave}
              disabled={isPending || loading}
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Icon library="lucide" name="Save" className="h-4 w-4" />
                  {avatarDraft ? "Guardar Cambios (Foto pendiente)" : "Guardar Cambios"}
                </>
              )}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
          <header>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Sesión</p>
            <h2 className="text-lg font-semibold">Cerrar Sesión</h2>
          </header>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-neo-text-secondary">
              Sal de tu cuenta y vuelve a iniciar sesión.
            </p>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Icon library="lucide" name="LogOut" className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  loading,
  action,
}: {
  label: string;
  value: string | null;
  icon: ReactNode;
  loading: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neo-border bg-neo-card p-4 shadow-sm hover:border-neo-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neo-text-secondary">
          {icon}
          {label}
        </div>
        {action}
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-6 w-20 animate-pulse rounded bg-neo-border/50" />
        ) : (
          <p className="truncate text-lg font-semibold text-neo-text-primary">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
