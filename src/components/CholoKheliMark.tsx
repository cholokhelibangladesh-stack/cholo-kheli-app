import markAsset from "@/assets/cholo-kheli-mark-cropped.png.asset.json";

interface Props {
  className?: string;
  /** Kept for API compatibility. */
  color?: string;
  accent?: string;
}

/* Official Cholo Kheli mark — tightly cropped PNG (transparent background,
   brand teal already baked in). Rendered as a plain <img> so it never
   distorts and does not depend on a CSS mask. */
const CholoKheliMark = ({ className = "" }: Props) => (
  <img
    src={markAsset.url}
    alt="Cholo Kheli"
    draggable={false}
    className={`block object-contain select-none ${className || "h-8 w-11"}`}
  />
);

export default CholoKheliMark;
