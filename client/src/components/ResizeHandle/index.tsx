type ResizeHandleProps = {
  direction: 'horizontal' | 'vertical'
}

function ResizeHandle({ direction }: ResizeHandleProps) {
  const isHorizontal = direction === 'horizontal'

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={`flex items-center justify-center rounded-full bg-neutral-600 px-1.5 py-1 ${
          isHorizontal ? 'flex-row gap-1' : 'flex-col gap-1'
        }`}
      >
        <span className="block h-1 w-1 rounded-full bg-neutral-300" />
        <span className="block h-1 w-1 rounded-full bg-neutral-300" />
        <span className="block h-1 w-1 rounded-full bg-neutral-300" />
      </div>
    </div>
  )
}

export default ResizeHandle
