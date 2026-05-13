export function parseProductCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

export const CSV_TEMPLATE = `name,description,price,unit,stock,category,delivery_type,delivery_area,pickup_location
Fresh Tomatoes,Sun-ripened organic tomatoes,35,kg,50,vegetables,both,Bangalore,Farm Gate Kolar
Organic Spinach,Iron-rich fresh spinach,25,bunch,30,vegetables,delivery,Mysuru,
`
