// @flow
import type {
  ParsedMap,
  VLQMap,
  SourceMapStringifyOptions,
  IndexedMapping,
} from "./types";

import path from "path";
import { generateInlineMap, partialVlqMapToSourceMap } from "./utils";

const bindings = require("node-gyp-build")(path.join(__dirname, ".."));

export default class SourceMap {
  sourceMapInstance: any;

  constructor() {
    this.sourceMapInstance = new bindings.SourceMap();
  }

  static generateEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ): SourceMap {
    let map = new SourceMap();
    map.addEmptyMap(sourceName, sourceContent, lineOffset);
    return map;
  }

  addEmptyMap(
    sourceName: string,
    sourceContent: string,
    lineOffset: number = 0
  ) {
    this.sourceMapInstance.addEmptyMap(sourceName, sourceContent, lineOffset);
    return this;
  }

  addRawMappings(
    mappings: string,
    sources: Array<string>,
    names: Array<string>,
    lineOffset: number = 0,
    columnOffset: number = 0
  ) {
    this.sourceMapInstance.addRawMappings(
      mappings,
      sources,
      names,
      lineOffset,
      columnOffset
    );
    return this;
  }

  addBufferMappings(
    buffer: Buffer,
    lineOffset: number = 0,
    columnOffset: number = 0
  ) {
    this.sourceMapInstance.addBufferMappings(buffer, lineOffset, columnOffset);
    return this;
  }

  // line numbers start at 1 so we have the same api as `source-map` by mozilla
  addIndexedMappings(
    mappings: Array<IndexedMapping<string>>,
    lineOffset?: number = 0,
    columnOffset?: number = 0
  ) {
    for (let mapping of mappings) {
      let hasValidOriginal =
        mapping.original &&
        typeof mapping.original.line === "number" &&
        !isNaN(mapping.original.line) &&
        typeof mapping.original.column === "number" &&
        !isNaN(mapping.original.column);

      this.sourceMapInstance.addIndexedMapping(
        mapping.generated.line + lineOffset - 1,
        mapping.generated.column + columnOffset,
        // $FlowFixMe
        hasValidOriginal ? mapping.original.line - 1 : -1,
        // $FlowFixMe
        hasValidOriginal ? mapping.original.column : -1,
        mapping.source || "",
        mapping.name || ""
      );
    }
    return this;
  }

  addName(name: string): number {
    return this.sourceMapInstance.addName(name);
  }

  addNames(names: Array<string>): Array<number> {
    return names.map((n) => this.addName(n));
  }

  addSource(source: string): number {
    return this.sourceMapInstance.addSource(source);
  }

  addSources(sources: Array<string>): Array<number> {
    return sources.map((s) => this.addSource(s));
  }

  getSourceIndex(source: string): number {
    return this.sourceMapInstance.getSourceIndex(source);
  }

  getSource(index: number): string {
    return this.sourceMapInstance.getSource(index);
  }

  getNameIndex(name: string): number {
    return this.sourceMapInstance.getNameIndex(name);
  }

  getName(index: number): string {
    return this.sourceMapInstance.getName(index);
  }

  findClosestMapping(line: number, column: number): ?IndexedMapping<number> {
    return this.sourceMapInstance.findClosestMapping(line, column);
  }

  // Remaps original positions from this map to the ones in the provided map
  extends(buffer: Buffer) {
    this.sourceMapInstance.extends(buffer);
    return this;
  }

  getMap(): ParsedMap {
    return this.sourceMapInstance.getMap();
  }

  toBuffer(): Buffer {
    return this.sourceMapInstance.toBuffer();
  }

  toVLQ(): VLQMap {
    return this.sourceMapInstance.stringify();
  }

  async stringify(options: SourceMapStringifyOptions) {
    return partialVlqMapToSourceMap(this.toVLQ(), options);
  }
}

export const init = Promise.resolve();
