
'use client'

import { useEffect, useRef, useState } from "react"
import 'leaflet/dist/leaflet.css'

export default function MapPicker({ onLocationSelected }) {
const mapRef = useRef(null)
const markerRef = useRef(null)
const containerRef = useRef(null)

const [loading, setLoading] = useState(true)

const defaultCenter = { lat: 21.9336, lng: 86.7102 }

useEffect(() => {
let map
let L

const initMap = async () => {
  L = (await import('leaflet')).default

  if (!mapRef.current) {
    map = L.map(containerRef.current).setView(
      [defaultCenter.lat, defaultCenter.lng],
      13
    )

    mapRef.current = map

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
      }
    ).addTo(map)

    // 🔥 Marker
    const marker = L.marker(
      [defaultCenter.lat, defaultCenter.lng],
      { draggable: true }
    ).addTo(map)

    markerRef.current = marker

    // Drag event
    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      onLocationSelected({
        lat: pos.lat,
        lng: pos.lng
      })
    })

    // Click event
    map.on("click", (e) => {
      const { lat, lng } = e.latlng

      marker.setLatLng([lat, lng])

      onLocationSelected({
        lat,
        lng
      })
    })
  }

  setLoading(false)
}

initMap()


}, [])

return ( <div className="mt-4"> <div
     ref={containerRef}
     className="w-full h-64 rounded border"
   />


  <p className="text-xs text-gray-500 mt-2">
    {loading
      ? "Loading map..."
      : "Click on map or drag marker to select location"}
  </p>
</div>


)
}
