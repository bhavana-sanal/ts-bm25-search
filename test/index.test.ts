import test from "node:test";
import assert from "node:assert/strict";
import { SearchIndex, tokenize } from "../src/index.js";

test("tokenize lowercases, removes stop words and plurals", () => {
  assert.deepEqual(tokenize("The Cats are on the mats!"), ["cat", "mat"]);
});

function corpus() {
  const ix = new SearchIndex();
  ix.add("ml", "machine learning models learn patterns from data");
  ix.add("dl", "deep learning uses neural networks with many layers");
  ix.add("cook", "a recipe for pasta with tomato sauce");
  return ix;
}

test("ranks relevant documents first", () => {
  const hits = corpus().search("neural networks");
  assert.equal(hits[0].id, "dl");
  assert.ok(!hits.some((h) => h.id === "cook"));
});

test("rarer terms outweigh common ones", () => {
  const ix = corpus();
  const [top] = ix.search("learning pasta");
  assert.equal(top.id, "cook");
});

test("remove and re-add update the index", () => {
  const ix = corpus();
  ix.remove("dl");
  assert.equal(ix.search("neural").length, 0);
  ix.add("cook", "neural pasta");
  assert.equal(ix.search("neural")[0].id, "cook");
  assert.equal(ix.size, 2);
});

test("empty index and unknown terms return nothing", () => {
  assert.deepEqual(new SearchIndex().search("x"), []);
  assert.deepEqual(corpus().search("zzzz"), []);
});
