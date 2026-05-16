import { describe, it, expect } from "vitest";
import {
  convertFileSize,
  calculatePercentage,
  getFileType,
  formatDateTime,
  getFileTypesParams,
  getUsageSummary,
  constructPreviewUrl,
} from "@/lib/utils";

describe("convertFileSize", () => {
  it("formats bytes when under 1 KB", () => {
    expect(convertFileSize(0)).toBe("0 Bytes");
    expect(convertFileSize(512)).toBe("512 Bytes");
    expect(convertFileSize(1023)).toBe("1023 Bytes");
  });

  it("formats KB when under 1 MB", () => {
    expect(convertFileSize(1024)).toBe("1.0 KB");
    expect(convertFileSize(1024 * 1023)).toBe("1023.0 KB");
  });

  it("formats MB when under 1 GB", () => {
    expect(convertFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(convertFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats GB when 1 GB or more", () => {
    expect(convertFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
    expect(convertFileSize(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
  });

  it("respects explicit digits argument", () => {
    expect(convertFileSize(1536, 2)).toBe("1.50 KB");
    expect(convertFileSize(1024 * 1024 * 1.5, 3)).toBe("1.500 MB");
  });
});

describe("calculatePercentage", () => {
  const TWO_GB = 2 * 1024 * 1024 * 1024;

  it("returns 0 for zero bytes", () => {
    expect(calculatePercentage(0)).toBe(0);
  });

  it("returns 50 for half capacity", () => {
    expect(calculatePercentage(TWO_GB / 2)).toBe(50);
  });

  it("returns 100 for full capacity", () => {
    expect(calculatePercentage(TWO_GB)).toBe(100);
  });

  it("returns >100 when over cap", () => {
    expect(calculatePercentage(TWO_GB * 2)).toBe(200);
  });
});

describe("getFileType", () => {
  it("classifies documents", () => {
    expect(getFileType("report.pdf")).toEqual({
      type: "document",
      extension: "pdf",
    });
    expect(getFileType("notes.DOCX").type).toBe("document");
  });

  it("classifies images", () => {
    expect(getFileType("photo.jpg")).toEqual({
      type: "image",
      extension: "jpg",
    });
  });

  it("classifies videos", () => {
    expect(getFileType("clip.mp4").type).toBe("video");
  });

  it("classifies audio", () => {
    expect(getFileType("song.mp3").type).toBe("audio");
  });

  it("returns other for unknown extension", () => {
    expect(getFileType("archive.zip")).toEqual({
      type: "other",
      extension: "zip",
    });
  });

  it("returns other with empty extension for empty filename", () => {
    expect(getFileType("")).toEqual({ type: "other", extension: "" });
  });

  it("treats a dotless name's whole name as the (lowercased) extension under 'other'", () => {
    expect(getFileType("README")).toEqual({
      type: "other",
      extension: "readme",
    });
  });
});

describe("formatDateTime", () => {
  it("returns em-dash for null/undefined", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("")).toBe("—");
  });

  it("formats AM time with zero-padded minutes", () => {
    // local-time constructor so test passes regardless of TZ
    const d = new Date(2024, 0, 5, 9, 5);
    expect(formatDateTime(d.toISOString())).toBe("9:05am, 5 Jan");
  });

  it("formats PM time", () => {
    const d = new Date(2024, 5, 15, 15, 30);
    expect(formatDateTime(d.toISOString())).toBe("3:30pm, 15 Jun");
  });

  it("treats midnight as 12am", () => {
    const d = new Date(2024, 2, 10, 0, 0);
    expect(formatDateTime(d.toISOString())).toBe("12:00am, 10 Mar");
  });

  it("treats noon as 12pm", () => {
    const d = new Date(2024, 11, 25, 12, 0);
    expect(formatDateTime(d.toISOString())).toBe("12:00pm, 25 Dec");
  });
});

describe("getFileTypesParams", () => {
  it("maps documents", () => {
    expect(getFileTypesParams("documents")).toEqual(["document"]);
  });
  it("maps images", () => {
    expect(getFileTypesParams("images")).toEqual(["image"]);
  });
  it("maps media to video + audio", () => {
    expect(getFileTypesParams("media")).toEqual(["video", "audio"]);
  });
  it("maps others", () => {
    expect(getFileTypesParams("others")).toEqual(["other"]);
  });
  it("falls back to document on unknown", () => {
    expect(getFileTypesParams("anything-else")).toEqual(["document"]);
  });
});

describe("getUsageSummary", () => {
  const totalSpace: TotalSpace = {
    image: { size: 100, latestDate: "2024-01-01T00:00:00Z" },
    document: { size: 200, latestDate: "2024-02-01T00:00:00Z" },
    video: { size: 300, latestDate: "2024-03-01T00:00:00Z" },
    audio: { size: 400, latestDate: "2024-04-01T00:00:00Z" },
    other: { size: 500, latestDate: "2024-05-01T00:00:00Z" },
    used: 1500,
    all: 2 * 1024 * 1024 * 1024,
  };

  it("produces a four-bucket summary in fixed order", () => {
    const summary = getUsageSummary(totalSpace);
    expect(summary).toHaveLength(4);
    expect(summary.map((s) => s.title)).toEqual([
      "Documents",
      "Images",
      "Media",
      "Others",
    ]);
  });

  it("Media bucket sums video + audio sizes", () => {
    const summary = getUsageSummary(totalSpace);
    const media = summary.find((s) => s.title === "Media")!;
    expect(media.size).toBe(700);
  });

  it("Media bucket picks the later of video/audio latestDate", () => {
    const summary = getUsageSummary(totalSpace);
    const media = summary.find((s) => s.title === "Media")!;
    expect(media.latestDate).toBe("2024-04-01T00:00:00Z");

    const swapped: TotalSpace = {
      ...totalSpace,
      video: { size: 300, latestDate: "2024-06-01T00:00:00Z" },
      audio: { size: 400, latestDate: "2024-04-01T00:00:00Z" },
    };
    const media2 = getUsageSummary(swapped).find((s) => s.title === "Media")!;
    expect(media2.latestDate).toBe("2024-06-01T00:00:00Z");
  });

  it("passes through per-bucket sizes and dates", () => {
    const summary = getUsageSummary(totalSpace);
    expect(summary[0].size).toBe(200);
    expect(summary[0].latestDate).toBe("2024-02-01T00:00:00Z");
    expect(summary[1].size).toBe(100);
    expect(summary[3].size).toBe(500);
  });
});

describe("constructPreviewUrl", () => {
  it("uses default 200x200 webp@85 when no opts are provided", () => {
    const url = constructPreviewUrl("blob-abc");
    expect(url).toContain("/files/blob-abc/preview");
    expect(url).toContain("width=200");
    expect(url).toContain("height=200");
    expect(url).toContain("output=webp");
    expect(url).toContain("quality=85");
  });

  it("threads custom width/height/quality through to query string", () => {
    const url = constructPreviewUrl("blob-xyz", {
      width: 1024,
      height: 1024,
      quality: 90,
    });
    expect(url).toContain("width=1024");
    expect(url).toContain("height=1024");
    expect(url).toContain("quality=90");
  });

  it("includes the project query param", () => {
    const url = constructPreviewUrl("blob-1");
    expect(url).toContain("project=");
  });
});
