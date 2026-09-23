import { GalleryClient } from "./gallery-client"
import { InstagramFeed } from "@/components/sections/instagram-feed"
import { fetchInstagramPosts } from "@/lib/instagram"

// Re-render at most hourly so new Instagram posts appear without a deploy.
// (Must be a literal for Next's static analysis; keep in step with INSTAGRAM_REVALIDATE_SECONDS.)
export const revalidate = 3600

export default async function GalleryPage() {
  const posts = await fetchInstagramPosts(8)
  return <GalleryClient instagram={<InstagramFeed posts={posts} />} />
}
