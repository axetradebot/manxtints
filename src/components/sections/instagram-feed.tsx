import Image from "next/image"
import { ArrowUpRight, Instagram, Layers, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion"
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, type InstagramPost } from "@/lib/instagram"

/**
 * "Latest work on Instagram" for the gallery page. With a feed it shows the
 * most recent posts as square tiles linking to Instagram; without one it still
 * gives visitors a clear route to the account.
 */
export function InstagramFeed({ posts }: { posts: InstagramPost[] }) {
  const hasPosts = posts.length > 0

  return (
    <section aria-labelledby="instagram-heading" className="border-y border-slate-100 bg-slate-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <Instagram className="h-4 w-4" />
                Instagram
              </p>
              <h2 id="instagram-heading" className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
                View our latest work on Instagram
              </h2>
              <p className="mt-3 text-slate-600">
                New installs go up on{" "}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-primary"
                >
                  @{INSTAGRAM_HANDLE}
                </a>{" "}
                as they happen — before, after and the odd time-lapse.
              </p>
            </div>
            <Button asChild size="lg" className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                Follow @{INSTAGRAM_HANDLE}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </FadeIn>

        {hasPosts ? (
          <FadeIn delay={0.1}>
            <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 md:gap-4">
              {posts.map((post, i) => (
                <li key={post.id}>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-xl bg-slate-200 sm:rounded-2xl"
                    aria-label={post.caption ? `${truncate(post.caption, 90)} — open on Instagram` : "Open post on Instagram"}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.caption ? truncate(post.caption, 120) : "ManxTints Instagram post"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading={i < 4 ? "eager" : "lazy"}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {post.mediaType !== "IMAGE" && (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm sm:right-3 sm:top-3">
                        {post.mediaType === "VIDEO" ? <Play className="h-3.5 w-3.5 fill-current" /> : <Layers className="h-3.5 w-3.5" />}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <p className="line-clamp-3 text-xs leading-snug text-white sm:text-sm">
                        {post.caption || "View on Instagram"}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center transition-colors hover:border-primary/40 hover:bg-blue-50/40 sm:flex-row sm:text-left"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20">
                <Instagram className="h-7 w-7" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">@{INSTAGRAM_HANDLE}</span>
                <span className="block text-sm text-slate-600">
                  Our most recent installs, reels and behind-the-scenes clips — updated more often than this page.
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open Instagram
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </FadeIn>
        )}
      </div>
    </section>
  )
}

function truncate(text: string, max: number): string {
  const oneLine = text.replace(/\s+/g, " ").trim()
  return oneLine.length > max ? `${oneLine.slice(0, max - 1).trimEnd()}…` : oneLine
}
