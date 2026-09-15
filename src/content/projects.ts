/**
 * Recent projects shown on the home page. The grid is hidden while this list
 * is empty.
 *
 * To add a project:
 *   1. Drop the photo in /public/projects/ named like
 *        YYYY-MM-<type>-<area>.jpg   e.g. 2026-04-conservatory-douglas.jpg
 *   2. Add an entry below pointing at it.
 */
export interface Project {
  /** Path under /public, e.g. "/projects/2026-04-conservatory-douglas.jpg" */
  photo: string
  /** What was fitted, e.g. "Conservatory roof · solar film" */
  type: string
  /** Where, e.g. "Douglas, Isle of Man" */
  area: string
  alt?: string
}

export const projects: Project[] = [
  // { photo: "/projects/2026-04-conservatory-douglas.jpg", type: "Conservatory roof · solar film", area: "Douglas, Isle of Man" },
]
