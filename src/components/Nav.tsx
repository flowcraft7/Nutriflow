export default function Nav({
  clinicName,
  backHref,
  backLabel = 'Dashboard',
}: {
  clinicName?: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        {backHref && (
          <a href={backHref} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            &larr; {backLabel}
          </a>
        )}
      </div>
      {clinicName && (
        <span className="text-sm font-semibold tracking-tight">{clinicName}</span>
      )}
    </div>
  )
}