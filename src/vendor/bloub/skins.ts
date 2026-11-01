import { PROFILE_SAMPLES } from './profiles'
import {
  hullOfCircles,
  profileFromPolygon,
  regularPolygonProfile,
  superellipseProfile,
  unionOfCirclesProfile
} from './shape'

/**
 * Formes et couleurs proposees par le personnalisateur du bot.
 *
 * A la difference des silhouettes d'animation (`profiles.ts`), celles-ci ne sont
 * PAS relevees sur la video : elles sont construites analytiquement d'apres la
 * grille du personnalisateur d'origine. Deux sources distinctes, donc, et c'est
 * volontaire — les etats animes doivent rester fideles a la video, les formes de
 * base sont un choix d'utilisateur.
 */

/**
 * Les identifiants sont enumeres plutot que deduits du tableau : c'est ce qui
 * permet a la couche i18n de verifier A LA COMPILATION que chaque forme a bien
 * sa traduction dans les trois langues (`t(\`shapes.${id}\`)` ne compile que si
 * la cle existe). Un `as const` sur le tableau aurait le meme effet mais
 * rendrait `radii` en lecture seule, alors que le moteur le passe tel quel.
 */
export type ShapeId =
  | 'cercle'
  | 'galet'
  | 'squircle'
  | 'capsule'
  | 'triangle'
  | 'hexagone'
  | 'nuage'
  | 'goutte'
  // Ajouts streaming-ui : les silhouettes des personnages chat, chien et fleur.
  | 'chat'
  | 'chien'
  | 'fleur'

export interface BotShape {
  id: ShapeId
  radii: number[]
}

/** Ramene le rayon maximal a `max` pour que toutes les formes pesent pareil a l'oeil. */
function normalize(radii: number[], max = 1): number[] {
  const peak = Math.max(...radii)
  if (peak <= 0) return radii
  const k = max / peak
  return radii.map((r) => r * k)
}

const ANGLES = Array.from({ length: PROFILE_SAMPLES }, (_, i) => (i / PROFILE_SAMPLES) * Math.PI * 2)

/** Galet : cercle deforme par deux harmoniques basses, donc irregulier mais lisse. */
const pebble = normalize(
  ANGLES.map((a) => 1 + 0.075 * Math.cos(2 * a + 0.5) + 0.035 * Math.cos(3 * a + 2.1)),
  1.02
)

/** Nuage : union de bosses, large en bas, deux lobes en haut. */
const cloud = normalize(
  unionOfCirclesProfile([
    { x: -0.44, y: 0.2, r: 0.54 },
    { x: 0.46, y: 0.2, r: 0.5 },
    { x: 0.02, y: 0.3, r: 0.6 },
    { x: -0.24, y: -0.3, r: 0.48 },
    { x: 0.3, y: -0.24, r: 0.44 }
  ]),
  1.02
)

/** Goutte : gros disque en bas, pointe effilee en haut. */
const droplet = normalize(
  profileFromPolygon(hullOfCircles(0, 0.28, 0.66, 0, -0.96, 0.05), 0, 0),
  1.04
)

/** Capsule couchee : enveloppe de deux disques cote a cote. */
const capsule = profileFromPolygon(hullOfCircles(-0.42, 0, 0.62, 0.42, 0, 0.62), 0, 0)

/* --- Ajouts streaming-ui (hors bloub amont) ------------------------------------------
 * Les personnages chat et chien n'existent pas dans bloub ; la fleur reprend la `fleur5`
 * de la PR #12 (non fusionnee) du depot amont. Meme contrat que les formes ci-dessus : un
 * profil radial calcule une fois a l'import, que `eyefit` couvre parce qu'il est dans
 * `SHAPES`. Les oreilles sortent du cercle mais restent sous 1,4 rayon, la marge des
 * anneaux (`repere.ts`). */

/**
 * Profil radial d'une region quelconque donnee par un predicat : le rayon le plus
 * lointain ou le rayon touche encore la region. Comme `unionOfCirclesProfile`, la forme
 * vue du centre ; un creux que masque une bosse plus lointaine sur le meme rayon est comble.
 */
function profileOfRegion(inside: (x: number, y: number) => boolean, reach = 1.5, step = 0.002): number[] {
  return ANGLES.map((a) => {
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    for (let r = reach; r > 0; r -= step) if (inside(r * dx, r * dy)) return r
    return 0
  })
}

/** Adoucit un profil (moyenne glissante 1-2-1) : arrondit les pointes des oreilles et des petales. */
function softenProfile(radii: number[], passes = 2): number[] {
  let out = [...radii]
  for (let pass = 0; pass < passes; pass++) {
    out = out.map((r, i) => ((out[(i - 1 + out.length) % out.length] ?? r) + 2 * r + (out[(i + 1) % out.length] ?? r)) / 4)
  }
  return out
}

const inDisc = (x: number, y: number, cx: number, cy: number, r: number) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r
const inTriangle = (x: number, y: number, [a, b, c]: [number, number][]) => {
  const side = (p: [number, number], q: [number, number]) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])
  const s1 = side(a!, b!)
  const s2 = side(b!, c!)
  const s3 = side(c!, a!)
  return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)
}
/** Ellipse de demi-axes rx, ry, tournee de `deg` autour de son centre. */
const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  const u = (x - cx) * Math.cos(a) + (y - cy) * Math.sin(a)
  const v = -(x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)
  return (u / rx) ** 2 + (v / ry) ** 2 <= 1
}

/** Chat : tete ronde et deux oreilles pointues, inclinees vers l'exterieur. */
const CAT_EAR: [number, number][] = [
  [-0.86, -0.3],
  [-0.6, -1.12],
  [-0.2, -0.82]
]
const cat = softenProfile(
  profileOfRegion(
    (x, y) => inDisc(x, y, 0, 0.04, 0.9) || inTriangle(x, y, CAT_EAR) || inTriangle(-x, y, CAT_EAR)
  ),
  1
)

/** Chien : tete ronde et deux oreilles tombantes, collees aux flancs et ecartees vers le bas. */
const dog = softenProfile(
  profileOfRegion(
    (x, y) => inDisc(x, y, 0, 0, 0.86) || inEllipse(x, y, -0.8, 0.16, 0.24, 0.5, 18) || inEllipse(x, y, 0.8, 0.16, 0.24, 0.5, -18)
  ),
  1
)

/** Fleur : cinq petales ronds autour d'un coeur, un petale en haut (PR #12 amont, `fleur5`). */
const flower = normalize(
  softenProfile(
    unionOfCirclesProfile([
      ...Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2
        return { x: Math.cos(a) * 0.56, y: Math.sin(a) * 0.56, r: 0.52 }
      }),
      { x: 0, y: 0, r: 0.5 }
    ]),
    4
  ),
  1.06
)

export const SHAPES: BotShape[] = [
  { id: 'cercle', radii: new Array(PROFILE_SAMPLES).fill(1) },
  { id: 'galet', radii: pebble },
  // 1.15 et pas 1.02 : sur une superellipse le rayon maximal est la diagonale,
  // donc normaliser dessus donne une forme qui parait plus petite que le cercle.
  { id: 'squircle', radii: normalize(superellipseProfile(4.2), 1.15) },
  { id: 'capsule', radii: capsule },
  // -90deg : un sommet vers le haut de l'ecran (y est oriente vers le bas)
  { id: 'triangle', radii: regularPolygonProfile(3, 1.12, 0.34, -90) },
  // 0deg : sommets a gauche et a droite, donc aretes du haut et du bas plates
  { id: 'hexagone', radii: regularPolygonProfile(6, 1.04, 0.26, 0) },
  { id: 'nuage', radii: cloud },
  { id: 'goutte', radii: droplet },
  { id: 'chat', radii: cat },
  { id: 'chien', radii: dog },
  { id: 'fleur', radii: flower }
]

// Map indexee par `string` et non par `ShapeId` : les appelants interrogent avec
// une valeur relue du localStorage ou d'une prop, donc non validee.
export const SHAPE_BY_ID = new Map<string, BotShape>(SHAPES.map((s) => [s.id, s]))
export const DEFAULT_SHAPE = 'cercle'

export type ColorId =
  | 'encre'
  | 'creme'
  | 'brun'
  | 'rouge'
  | 'orange'
  | 'ambre'
  | 'vert'
  | 'turquoise'
  | 'bleu'
  | 'violet'
  | 'rose'
  | 'gris'

export interface BotColor {
  id: ColorId
  hex: string
}

/** Palette du personnalisateur d'origine. */
export const COLORS: BotColor[] = [
  { id: 'encre', hex: '#0a0a0c' },
  { id: 'brun', hex: '#8b5e3c' },
  { id: 'rouge', hex: '#e8483f' },
  { id: 'orange', hex: '#f08a24' },
  { id: 'ambre', hex: '#f0b429' },
  { id: 'vert', hex: '#3ecf8e' },
  { id: 'turquoise', hex: '#2fbfa0' },
  { id: 'bleu', hex: '#3b93f0' },
  { id: 'violet', hex: '#8b5cf6' },
  { id: 'rose', hex: '#e152b0' },
  { id: 'gris', hex: '#a3a3a3' },
  { id: 'creme', hex: '#f1efe9' }
]

export const COLOR_BY_ID = new Map<string, BotColor>(COLORS.map((c) => [c.id, c]))
export const DEFAULT_COLOR = 'encre'

/** Melange deux couleurs hex. Sert a la brume de profondeur des particules. */
export function mixHex(from: string, to: string, t: number): string {
  const parse = (h: string) => {
    const v = parseInt(h.slice(1), 16)
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
  }
  const a = parse(from)
  const b = parse(to)
  const c = a.map((x, i) => Math.round(x + (b[i]! - x) * t))
  return `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`
}
