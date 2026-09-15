"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { projects } from "@/content/projects"

/** Recent projects from content/projects.ts. Renders nothing while the list is empty. */
export function ProjectsGrid() {
  if (projects.length === 0) return null
  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Recent projects</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">Fitted by our installers</h2>
          </div>
        </FadeIn>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.photo}>
              <motion.figure
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={project.photo}
                    alt={project.alt ?? `${project.type} — ${project.area}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="font-semibold text-slate-900">{project.type}</p>
                  <p className="text-sm text-slate-500">{project.area}</p>
                </figcaption>
              </motion.figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
