import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = [] as number[]
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between space-x-4 mt-4">
      <button
        className="px-3 py-1 rounded border"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Prev
      </button>

      <div className="flex gap-2">
        {start > 1 && (
          <button className="px-3 py-1 rounded border" onClick={() => onPageChange(1)}>1</button>
        )}
        {start > 2 && <span className="px-2">...</span>}
        {pages.map((p) => (
          <button
            key={p}
            className={`px-3 py-1 rounded border ${p === page ? 'bg-primary text-white' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        {end < totalPages - 1 && <span className="px-2">...</span>}
        {end < totalPages && (
          <button className="px-3 py-1 rounded border" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        )}
      </div>

      <button
        className="px-3 py-1 rounded border"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
