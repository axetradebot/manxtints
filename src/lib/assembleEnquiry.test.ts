import { describe, expect, it } from "vitest"
import { assembleEnquiryMessage, enquiryServiceLabel } from "./assembleEnquiry"

describe("assembleEnquiryMessage", () => {
  it("omits empty sections", () => {
    expect(
      assembleEnquiryMessage({
        needs: [],
        propertyType: null,
        description: "  ",
        photoUrls: [],
        photoUploadFailed: false,
      })
    ).toBe("")
  })

  it("puts photo URLs on their own lines", () => {
    const message = assembleEnquiryMessage({
      needs: ["Privacy", "Heat reduction"],
      propertyType: "Conservatory",
      description: "Two lounge windows",
      photoUrls: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
      photoUploadFailed: false,
    })
    expect(message).toBe(
      [
        "Looking for: Privacy, Heat reduction",
        "Property: Conservatory",
        "Description: Two lounge windows",
        "Photos:",
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
      ].join("\n")
    )
  })

  it("notes photo upload failure without dropping the rest", () => {
    const message = assembleEnquiryMessage({
      needs: ["Not sure, advise me"],
      propertyType: null,
      description: "",
      photoUrls: [],
      photoUploadFailed: true,
    })
    expect(message).toBe("Looking for: Not sure, advise me\nPhotos: photo upload failed")
  })
})

describe("enquiryServiceLabel", () => {
  it("falls back to Property when no type is selected", () => {
    expect(enquiryServiceLabel(null)).toBe("Quote Enquiry — Property")
    expect(enquiryServiceLabel("Vehicle")).toBe("Quote Enquiry — Vehicle")
  })
})
