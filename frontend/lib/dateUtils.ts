export function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('es-AR', { month: 'short' }).toUpperCase(),
    time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs',
  }
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
