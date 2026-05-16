'use client'
import dynamic from 'next/dynamic'

const LocationEditor = dynamic(() => import('./LocationEditorClient'), { ssr: false })

export default function LocationPage() {
  return <LocationEditor />
}
