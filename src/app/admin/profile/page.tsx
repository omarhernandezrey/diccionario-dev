"use client";

import { useEffect, useState, useTransition, useRef, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { notifySessionChange } from "@/components/admin/SessionProvider";
import Cropper, { Area, Point } from "react-easy-crop";

const avatarFallback = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=240&radius=50&backgroundColor=b6c3ff`;

import { useUser } from "@/hooks/useUser";

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

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Canvas intermedio con el recorte exacto a full resolución
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  const cropCtx = cropCanvas.getContext("2d");

  if (!cropCtx) return null;

  cropCtx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Redimensionar si es necesario para optimizar tamaño (max 400x400)
  const maxDimension = 400;
  const finalCanvas = document.createElement("canvas");

  // Mantener aspecto cuadrado ya que el crop es cuadrado (aspect={1})
  const finalSize = Math.min(pixelCrop.width, maxDimension);

  finalCanvas.width = finalSize;
  finalCanvas.height = finalSize;

  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return null;

  // Usar imageSmoothingQuality para mejor resultado al reducir
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";

  finalCtx.drawImage(
    cropCanvas,
    0, 0, pixelCrop.width, pixelCrop.height,
    0, 0, finalSize, finalSize
  );

  // Retornar JPEG con calidad 0.8 para asegurar <1MB
  return finalCanvas.toDataURL("image/jpeg", 0.8);
}

// --- Main Component ---

export default function AdminProfilePage() {
  const { user: session, isLoading: loading, mutate } = useUser();
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states - initialized when session loads
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [copied, setCopied] = useState(false);

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);

  // Cropping states
  const [isCropping, setIsCropping] = useState(false);
  const [tempImgUrl, setTempImgUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with session data when it loads
  useEffect(() => {
    if (session) {
      setDisplayName(session.displayName || session.username);
      setBio(session.bio || "");
      const fallback = avatarFallback(session.username);
      setAvatarPreview(session.avatarUrl || fallback);
    }
  }, [session]);

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
      window.location.href = "/login";
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

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const saveCroppedImage = async () => {
    if (!tempImgUrl || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(tempImgUrl, croppedAreaPixels, rotation);
      if (croppedImage) {
        setAvatarPreview(croppedImage);
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
                  Aplicar y Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-4xl border border-neo-border bg-neo-card p-8 shadow-glow-card">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-neo-primary/10 to-transparent blur-3xl lg:block" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-neo-surface shadow-xl transition-transform group-hover:scale-105">
              <Image
                src={avatarPreview || avatarFallback(session?.username || "default")}
                alt="Avatar"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 rounded-full bg-neo-primary p-2 text-white shadow-lg hover:scale-110 hover:bg-neo-primary-dark transition-all"
              title="Cambiar foto"
            >
              <Icon library="lucide" name="Camera" className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-neo-text-primary">{displayName || session?.username}</h1>
              {session?.role === "admin" && (
                <span className="rounded-full bg-neo-primary/10 px-2 py-0.5 text-xs font-medium text-neo-primary border border-neo-primary/20">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-neo-text-secondary">@{session?.username}</p>
          </div>
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
                  Guardar Cambios
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
