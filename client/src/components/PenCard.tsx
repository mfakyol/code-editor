import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IconHeartFilled, IconUser } from '@tabler/icons-react'
import type { PublicPen } from '@/services/pen.service'
import { buildSrcDoc } from '@/utils/buildSrcDoc'
import { useI18n } from '@/stores/i18n.store'

function Thumbnail({ pen }: { pen: PublicPen }) {
  const srcDoc = useMemo(
    () =>
      buildSrcDoc(pen.html, pen.css, pen.js, {
        externalScripts: pen.settings.externalScripts,
        externalStyles: pen.settings.externalStyles,
      }),
    [pen],
  )

  return (
    <div className="pointer-events-none relative h-40 overflow-hidden bg-white">
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        title={pen.title}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{ width: '200%', height: '200%', transform: 'scale(0.5)' }}
      />
    </div>
  )
}

type PenCardProps = {
  pen: PublicPen

  showOwner?: boolean
}

function PenCard({ pen, showOwner = true }: PenCardProps) {
  const { t } = useI18n()
  return (
    <li className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600">
      <Link to={`/pen/${pen._id}/full`} className="block">
        <Thumbnail pen={pen} />
        <div className="flex items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-100">{pen.title}</p>
            {showOwner && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                <IconUser className="h-3 w-3" stroke={2} />
                {pen.ownerName ?? t('penCard.anon')}
              </p>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm text-neutral-400">
            <IconHeartFilled className="h-4 w-4 text-rose-400" />
            {pen.likeCount}
          </span>
        </div>
      </Link>
    </li>
  )
}

export default PenCard
