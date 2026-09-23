import { describe, expect, it } from "vitest"
import { normaliseInstagramMedia } from "./instagram"

describe("normaliseInstagramMedia", () => {
  it("uses the poster frame for videos and the media url otherwise", () => {
    const posts = normaliseInstagramMedia(
      [
        { id: "1", permalink: "https://ig/p/1", media_type: "IMAGE", media_url: "https://cdn/1.jpg", caption: " Front room \n done " },
        { id: "2", permalink: "https://ig/p/2", media_type: "VIDEO", media_url: "https://cdn/2.mp4", thumbnail_url: "https://cdn/2.jpg" },
        { id: "3", permalink: "https://ig/p/3", media_type: "CAROUSEL_ALBUM", media_url: "https://cdn/3.jpg" },
      ],
      8
    )
    expect(posts.map((p) => p.imageUrl)).toEqual(["https://cdn/1.jpg", "https://cdn/2.jpg", "https://cdn/3.jpg"])
    expect(posts[0].caption).toBe("Front room \n done")
    expect(posts[1].caption).toBe("")
  })

  it("drops items without an image or permalink and respects the limit", () => {
    const posts = normaliseInstagramMedia(
      [
        { id: "bad-1", permalink: "https://ig/p/x", media_type: "VIDEO", media_url: "https://cdn/x.mp4" },
        { id: "bad-2", media_type: "IMAGE", media_url: "https://cdn/y.jpg" },
        { id: "a", permalink: "https://ig/p/a", media_type: "IMAGE", media_url: "https://cdn/a.jpg" },
        { id: "b", permalink: "https://ig/p/b", media_type: "IMAGE", media_url: "https://cdn/b.jpg" },
        { id: "c", permalink: "https://ig/p/c", media_type: "IMAGE", media_url: "https://cdn/c.jpg" },
      ],
      2
    )
    expect(posts.map((p) => p.id)).toEqual(["a", "b"])
  })
})
