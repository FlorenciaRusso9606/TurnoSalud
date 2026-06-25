'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS   = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

interface Props {
  selected?: string
  onSelect: (date: string) => void
  highlightedDates?: string[]
  fullyBookedDates?: string[]
  disablePast?: boolean
}

function localStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr(): string {
  return localStr(new Date())
}

function getDayClass(isSelected: boolean, isDisabled: boolean, hasData: boolean, isFullyBooked: boolean, isToday: boolean): string {
  const base = 'relative mx-auto flex h-8 w-8 items-center justify-center text-sm transition-colors rounded-md'
  if (isDisabled)    return `${base} text-gray-300 cursor-not-allowed`
  if (isSelected)    return `${base} bg-[#2a9d8f] text-white font-semibold cursor-pointer`
  if (isFullyBooked) return `${base} bg-red-50 text-red-400 font-medium cursor-pointer hover:bg-red-100`
  if (hasData)       return `${base} bg-[#2a9d8f]/15 text-[#2a9d8f] font-medium cursor-pointer hover:bg-[#2a9d8f]/25`
  if (isToday)       return `${base} font-bold text-[#2a9d8f] cursor-pointer hover:bg-gray-100`
  return `${base} text-gray-700 cursor-pointer hover:bg-gray-100`
}

export function CalendarPicker({ selected, onSelect, highlightedDates = [], fullyBookedDates = [], disablePast = false }: Props) {
  const today = todayStr()

  const [view, setView] = useState(() => {
    const d = selected ? new Date(selected + 'T12:00:00') : new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const highlighted  = new Set(highlightedDates)
  const fullyBooked  = new Set(fullyBookedDates)

  function getDays(): (Date | null)[] {
    const first  = new Date(view.year, view.month, 1)
    const offset = (first.getDay() + 6) % 7
    const cells: (Date | null)[] = Array(offset).fill(null)
    const count  = new Date(view.year, view.month + 1, 0).getDate()
    for (let i = 1; i <= count; i++) cells.push(new Date(view.year, view.month, i))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  function shift(delta: number) {
    setView(v => {
      const d = new Date(v.year, v.month + delta)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const days = getDays()

  return (
    <div className="select-none w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <p key={d} className="text-center text-xs font-medium text-gray-400">{d}</p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((d, i) => {
          if (!d) return <div key={`_${i}`} />
          const str           = localStr(d)
          const isSelected    = str === selected
          const isToday       = str === today
          const isDisabled    = disablePast && str < today
          const isFullyBooked = fullyBooked.has(str)
          const hasData       = highlighted.has(str) && !isFullyBooked

          return (
            <button
              key={str}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(str)}
              className={getDayClass(isSelected, isDisabled, hasData, isFullyBooked, isToday)}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
