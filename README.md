# ts-bm25-search

[![CI](https://github.com/bhavana-sanal/ts-bm25-search/actions/workflows/ci.yml/badge.svg)](https://github.com/bhavana-sanal/ts-bm25-search/actions) ![License](https://img.shields.io/badge/license-MIT-blue)

A tiny **full-text search engine in TypeScript**: an inverted index ranked with **Okapi BM25**, the scoring function behind Lucene and Elasticsearch.
It has no runtime dependencies and ships its own type declarations.

```ts
import { SearchIndex } from "ts-bm25-search";

const ix = new SearchIndex();
ix.add("dl", "deep learning uses neural networks");
ix.add("cook", "a recipe for pasta");
ix.search("neural networks"); // [{ id: "dl", score: 1.2 }]
```

- Tokenizer with stop-word removal and plural stemming
- Incremental `add` / `remove`
- Tunable `k1` and `b` parameters

```bash
npm install
npm test
```
