import { useEffect, useRef } from 'react'

/*
  3D ASCII Globe — user's ASCII Earth art mapped onto a rotating sphere.
  Each character becomes a 3D point. Front chars glow green, back chars fade.
  Large globe, centered in the hero.
*/

// User's ASCII Earth art — 23 rows
const EARTH_ART: string[] = [
  '              _-o#&&*\'\'\'\'?d:>b\\_',
  '          _o/"`\'\'  \'\',, dMF9MMMMMHo_',
  '       .o&#\'        `"MbHMMMMMMMMMMMHo.',
  '     .o"" \'         vodM*$&&HMMMMMMMMMM?.',
  '    ,\'              $M&ood,~`\`(&##MMMMMMH\\',
  '   /               ,MMMMMMM#b?#bobMMMMHMMML',
  '  &              ?MMMMMMMMMMMMMMMMM7MMM$R*Hk',
  ' ?$.            :MMMMMMMMMMMMMMMMMMM/HMMM|`*L',
  '|               |MMMMMMMMMMMMMMMMMMMMbMH\'   T,',
  '$H#:            `*MMMMMMMMMMMMMMMMMMMMb#}\'  `?',
  ']MMH#             ""*""""*#MMMMMMMMMMMMM\'    -',
  'MMMMMb_                   |MMMMMMMMMMMP\'     :',
  'HMMMMMMMHo                 `MMMMMMMMMT       .',
  '?MMMMMMMMP                  9MMMMMMMM}       -',
  '-?MMMMMMM                  |MMMMMMMMM?,d-    \'',
  ' :|MMMMMM-                 `MMMMMMMT .M|.   :',
  '  .9MMM[                    &MMMMM*\' `\'    .',
  '   :9MMk                    `MMM#"        -',
  '     &M}                     `          .-',
  '      `&.                             .',
  '        `~,   .                     ./',
  '            . _                  .-',
  '              `\`--._,dd###pp=""\'',
]

interface GlobeChar {
  x: number // 2D position in art
  y: number
  char: string
  dist: number // distance from center (0-1)
}

// Parse art into character positions within the globe circle
function parseArt(): GlobeChar[] {
  const rows = EARTH_ART.length
  const cy = rows / 2
  const cols = Math.max(...EARTH_ART.map((r) => r.length))
  const cx = cols / 2
  const maxR = Math.min(cx, cy) - 0.5

  const chars: GlobeChar[] = []

  for (let y = 0; y < rows; y++) {
    const row = EARTH_ART[y]
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === ' ') continue

      const dx = (x - cx) / maxR
      const dy = (y - cy) / maxR
      const d = Math.sqrt(dx * dx + dy * dy)

      if (d > 1.0) continue // Outside globe

      chars.push({ x, y, char: ch, dist: d })
    }
  }

  return chars
}

// Map 2D art position to spherical coordinates
function artToSphere(g: GlobeChar): { lat: number; lng: number; char: string } {
  const rows = EARTH_ART.length
  const cy = rows / 2
  const cols = Math.max(...EARTH_ART.map((r) => r.length))
  const cx = cols / 2
  const maxR = Math.min(cx, cy) - 0.5

  const dx = (g.x - cx) / maxR
  const dy = (g.y - cy) / maxR

  // Latitude from y (flip so top is north)
  const lat = -dy * 90

  // Longitude from x
  const lng = dx * 180

  return { lat, lng, char: g.char }
}

export default function HeroGlobeASCII() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let disposed = false

    const dpr = Math.min(window.devicePixelRatio, 2)
    let W = 0
    let H = 0

    const resize = () => {
      const parent = canvas.parentElement
      W = parent?.clientWidth || window.innerWidth
      H = parent?.clientHeight || window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Globe params — BIGGER sphere, positioned with gap from nav
    const GLOBE_R = Math.min(W, H) * 0.58
    const cx = W / 2
    const cy = H * 0.52

    // Parse and convert art
    const artChars = parseArt()
    const sphereChars = artChars.map(artToSphere)

    // Characters for land brightness levels
    const LAND_CHARS = '.,-~:;=!*#$@'.split('')

    const draw = (time: number) => {
      if (disposed) return
      animId = requestAnimationFrame(draw)

      ctx.clearRect(0, 0, W, H)

      const rotation = time * 0.00022
      const tilt = 0.25

      // Project all characters to 3D
      const projected: {
        x: number
        y: number
        z: number
        char: string
        isEdge: boolean
      }[] = []

      for (const sc of sphereChars) {
        const latRad = (sc.lat * Math.PI) / 180
        const lngRad = (sc.lng * Math.PI) / 180 + rotation

        // 3D on sphere
        const x3d = GLOBE_R * Math.cos(latRad) * Math.sin(lngRad)
        const y3d = GLOBE_R * Math.sin(latRad)
        const z3d = GLOBE_R * Math.cos(latRad) * Math.cos(lngRad)

        // Tilt around X
        const yT = y3d * Math.cos(tilt) - z3d * Math.sin(tilt)
        const zT = y3d * Math.sin(tilt) + z3d * Math.cos(tilt)

        // Perspective
        const persp = 800
        const scale = persp / (persp - zT * 0.5)

        projected.push({
          x: cx + x3d * scale,
          y: cy + yT * scale,
          z: zT,
          char: sc.char,
          isEdge: /[\\/_|&^~`\-'.]/.test(sc.char),
        })
      }

      // Sort back to front
      projected.sort((a, b) => a.z - b.z)

      // Atmospheric glow
      const glowGrad = ctx.createRadialGradient(cx, cy, GLOBE_R * 0.7, cx, cy, GLOBE_R * 1.35)
      glowGrad.addColorStop(0, 'rgba(45, 157, 94, 0)')
      glowGrad.addColorStop(0.5, 'rgba(45, 157, 94, 0.05)')
      glowGrad.addColorStop(1, 'rgba(45, 157, 94, 0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, GLOBE_R * 1.35, 0, Math.PI * 2)
      ctx.fill()

      // Draw each character
      for (const p of projected) {
        const nz = (p.z + GLOBE_R) / (2 * GLOBE_R) // 0..1 (0=back, 1=front)
        if (nz < 0.05) continue

        const isFront = nz > 0.5
        const alpha = isFront ? 0.3 + nz * 0.7 : nz * 0.08

        if (!isFront) {
          // Back — very faint silhouette
          ctx.fillStyle = `rgba(45, 157, 94, ${alpha * 0.12})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2)
          ctx.fill()
          continue
        }

        // Front-facing characters
        const size = Math.max(5, nz * 9)
        const bri = Math.floor(nz * 200 + 55)

        // Pick a land character based on depth
        const ci = Math.floor(nz * (LAND_CHARS.length - 1))
        const displayChar = LAND_CHARS[ci]

        // Green color with depth variation
        ctx.fillStyle = `rgba(${Math.floor(30 + nz * 50)}, ${bri}, ${Math.floor(50 + nz * 90)}, ${alpha})`
        ctx.font = `${size}px "Geist Mono", "Space Mono", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(displayChar, p.x, p.y)

        // Edge characters get extra glow
        if (p.isEdge && nz > 0.7) {
          ctx.fillStyle = `rgba(94, 232, 144, ${alpha * 0.15})`
          ctx.font = `${size * 1.2}px "Geist Mono", monospace`
          ctx.fillText(displayChar, p.x, p.y)
        }
      }

      // Rim atmospheric glow
      const rimGrad = ctx.createRadialGradient(cx, cy, GLOBE_R * 0.85, cx, cy, GLOBE_R * 1.05)
      rimGrad.addColorStop(0, 'rgba(45, 157, 94, 0)')
      rimGrad.addColorStop(0.7, 'rgba(45, 157, 94, 0.06)')
      rimGrad.addColorStop(1, 'rgba(45, 157, 94, 0)')
      ctx.fillStyle = rimGrad
      ctx.beginPath()
      ctx.arc(cx, cy, GLOBE_R * 1.05, 0, Math.PI * 2)
      ctx.fill()

      // Orbital rings
      const rings = [
        { rx: GLOBE_R * 1.25, ry: GLOBE_R * 0.24, tilt: -0.4, speed: 0.00012, offset: 0 },
        { rx: GLOBE_R * 1.45, ry: GLOBE_R * 0.18, tilt: 0.5, speed: -0.00009, offset: Math.PI * 0.5 },
        { rx: GLOBE_R * 1.1, ry: GLOBE_R * 0.28, tilt: 0.1, speed: 0.00016, offset: Math.PI },
      ]

      for (let ri = 0; ri < rings.length; ri++) {
        const ring = rings[ri]
        ctx.save()
        ctx.translate(cx, cy)

        ctx.strokeStyle = `rgba(45, 157, 94, ${0.1 + ri * 0.03})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(0, 0, ring.rx, ring.ry, ring.tilt, 0, Math.PI * 2)
        ctx.stroke()

        const angle = time * ring.speed + ring.offset
        const dotX = ring.rx * Math.cos(angle) * Math.cos(ring.tilt) - ring.ry * Math.sin(angle) * Math.sin(ring.tilt)
        const dotY = ring.rx * Math.cos(angle) * Math.sin(ring.tilt) + ring.ry * Math.sin(angle) * Math.cos(ring.tilt)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'rgba(45, 157, 94, 0.22)'
        ctx.beginPath()
        ctx.arc(dotX, dotY, 7, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }
    }

    animId = requestAnimationFrame(draw)

    return () => {
      disposed = true
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  )
}
