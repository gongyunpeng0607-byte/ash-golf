// ASH GOLF placeholder when no product image is available
export const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%23f5f5f5' width='400' height='500'/%3E%3Ctext fill='%23cccccc' font-family='sans-serif' font-size='72' text-anchor='middle' dominant-baseline='central' x='200' y='250'%3EASH%3C/text%3E%3C/svg%3E";

export function PlaceholderImg({ className }: { className?: string }) {
  return (
    <img
      src={PLACEHOLDER_SVG}
      alt="ASH GOLF"
      className={className || "w-full h-full object-cover"}
    />
  );
}
