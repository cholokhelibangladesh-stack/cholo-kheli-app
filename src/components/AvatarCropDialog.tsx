import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

interface PreviewInfo {
  fullName?: string;
  username?: string;
  role?: string;
  sportLabel?: string;
  stats?: { label: string; value: string }[];
}

interface AvatarCropDialogProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
  /** Output aspect ratio (width / height). Card is 4/5 on mobile. */
  aspect?: number;
  /** Output pixel width. Height derived from aspect. */
  outputWidth?: number;
  /** Info rendered on top of the preview so it mirrors the real card. */
  preview?: PreviewInfo;
}

/**
 * Interactive avatar positioner: pan + zoom to frame the photo exactly
 * as it will appear inside the profile card, then export a cropped blob.
 */
const AvatarCropDialog = ({
  file,
  open,
  onOpenChange,
  onConfirm,
  aspect = 4 / 5,
  outputWidth = 1080,
  preview,
}: AvatarCropDialogProps) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!file) { setImgUrl(null); setImgSize(null); return; }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Base scale so the image "covers" the frame at zoom = 1
  const getBaseScale = useCallback(() => {
    if (!imgSize || !frameRef.current) return 1;
    const fw = frameRef.current.clientWidth;
    const fh = frameRef.current.clientHeight;
    return Math.max(fw / imgSize.w, fh / imgSize.h);
  }, [imgSize]);

  const clampOffset = useCallback((x: number, y: number, z: number) => {
    if (!imgSize || !frameRef.current) return { x, y };
    const fw = frameRef.current.clientWidth;
    const fh = frameRef.current.clientHeight;
    const base = getBaseScale();
    const dw = imgSize.w * base * z;
    const dh = imgSize.h * base * z;
    const maxX = Math.max(0, (dw - fw) / 2);
    const maxY = Math.max(0, (dh - fh) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [imgSize, getBaseScale]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setOffset(clampOffset(dragRef.current.ox + dx, dragRef.current.oy + dy, zoom));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const onZoom = (v: number[]) => {
    const z = v[0];
    setZoom(z);
    setOffset((o) => clampOffset(o.x, o.y, z));
  };

  const handleConfirm = async () => {
    if (!imgUrl || !imgSize || !frameRef.current) return;
    setSaving(true);
    try {
      const fw = frameRef.current.clientWidth;
      const fh = frameRef.current.clientHeight;
      const base = getBaseScale();
      const scale = base * zoom;
      // Image top-left in frame coordinates
      const dw = imgSize.w * scale;
      const dh = imgSize.h * scale;
      const imgLeft = (fw - dw) / 2 + offset.x;
      const imgTop = (fh - dh) / 2 + offset.y;

      // Source rectangle on the natural image that corresponds to the frame
      const sx = (-imgLeft) / scale;
      const sy = (-imgTop) / scale;
      const sw = fw / scale;
      const sh = fh / scale;

      const outW = outputWidth;
      const outH = Math.round(outputWidth / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = imgUrl;
      });
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/jpeg", 0.92)
      );
      await onConfirm(blob);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preview your profile card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            This is how your card will look. Drag the photo to reposition it.
          </p>
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative w-full overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.35)] select-none touch-none cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: String(aspect) }}
          >
            {imgUrl && imgSize && (
              <img
                src={imgUrl}
                alt="Crop preview"
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
                style={{
                  width: imgSize.w * getBaseScale() * zoom,
                  height: imgSize.h * getBaseScale() * zoom,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}

            {/* Top scrim, mirrors real card */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

            {/* Top-left role/sport label */}
            {(preview?.role || preview?.sportLabel) && (
              <div className="absolute top-4 left-4 pointer-events-none">
                <div className="text-[11px] font-bold tracking-widest text-foreground/90 uppercase drop-shadow-sm">
                  {preview?.role}
                  {preview?.sportLabel ? <span className="text-foreground/60"> · {preview.sportLabel}</span> : null}
                </div>
              </div>
            )}

            {/* Glass bar — matches the real card */}
            <div className="absolute inset-x-0 bottom-0 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-t border-white/25 text-foreground pointer-events-none">
              <div className="px-5 pt-2.5 pb-2 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display text-2xl leading-tight truncate drop-shadow-sm">
                    {preview?.fullName || "Your Name"}
                  </div>
                  <div className="text-xs text-foreground/70 truncate">@{preview?.username || "username"}</div>
                </div>
                <div className="rounded-full shrink-0 shadow-sm bg-primary text-primary-foreground text-xs px-3 py-1">
                  Edit
                </div>
              </div>
              {preview?.stats && preview.stats.length > 0 && (
                <div className="px-5 pb-3 grid grid-cols-4 gap-2 border-t border-white/15 pt-2">
                  {preview.stats.slice(0, 4).map((s) => (
                    <div key={s.label} className="text-center min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-foreground/70">{s.label}</div>
                      <div className="font-display text-lg mt-0.5 truncate drop-shadow-sm">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Zoom</span>
              <span>{zoom.toFixed(2)}×</span>
            </div>
            <Slider value={[zoom]} min={1} max={4} step={0.01} onValueChange={onZoom} />
          </div>

          <p className="text-xs text-muted-foreground">Drag to reposition · pinch or slider to zoom.</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={saving || !imgSize}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Confirm & save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropDialog;
