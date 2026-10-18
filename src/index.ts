const STOP = new Set("a an and are as at be by for from has in is it its of on or that the to was were will with".split(" "));

/** Lowercase, split on non-alphanumerics, drop stop words, and apply a light plural stemmer. */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((t) => !STOP.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t));
}

export interface Hit {
  id: string;
  score: number;
}

/** Inverted index ranked with Okapi BM25. */
export class SearchIndex {
  private postings = new Map<string, Map<string, number>>(); // term -> docId -> term frequency
  private lengths = new Map<string, number>();
  private totalLength = 0;

  constructor(private k1 = 1.5, private b = 0.75) {}

  get size(): number {
    return this.lengths.size;
  }

  add(id: string, text: string): void {
    if (this.lengths.has(id)) this.remove(id);
    const tokens = tokenize(text);
    this.lengths.set(id, tokens.length);
    this.totalLength += tokens.length;
    for (const t of tokens) {
      const docs = this.postings.get(t) ?? new Map<string, number>();
      docs.set(id, (docs.get(id) ?? 0) + 1);
      this.postings.set(t, docs);
    }
  }

  remove(id: string): void {
    const len = this.lengths.get(id);
    if (len === undefined) return;
    this.totalLength -= len;
    this.lengths.delete(id);
    for (const [term, docs] of this.postings) {
      docs.delete(id);
      if (docs.size === 0) this.postings.delete(term);
    }
  }

  search(query: string, limit = 10): Hit[] {
    const n = this.size;
    if (n === 0) return [];
    const avgLen = this.totalLength / n;
    const scores = new Map<string, number>();
    for (const term of new Set(tokenize(query))) {
      const docs = this.postings.get(term);
      if (!docs) continue;
      const idf = Math.log(1 + (n - docs.size + 0.5) / (docs.size + 0.5));
      for (const [id, tf] of docs) {
        const norm = 1 - this.b + (this.b * this.lengths.get(id)!) / avgLen;
        scores.set(id, (scores.get(id) ?? 0) + (idf * tf * (this.k1 + 1)) / (tf + this.k1 * norm));
      }
    }
    return [...scores]
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, limit);
  }
}
