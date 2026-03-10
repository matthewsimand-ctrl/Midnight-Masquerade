export function toDisplayText(content: unknown): string {
  if (typeof content === "string") return content;
  if (content == null) return "";

  if (typeof content === "object") {
    const value = content as Record<string, unknown>;

    for (const key of ["text", "word", "label", "name", "section"]) {
      const candidate = value[key];
      if (typeof candidate === "string") return candidate;
    }

    return JSON.stringify(content);
  }

  return String(content);
}
