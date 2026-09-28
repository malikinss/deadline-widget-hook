// ./src/notion/blocks.ts

import type { NotionBlock } from "./types";

export interface EmbedBlock extends NotionBlock {
  type: "embed";
  embed: { url: string };
}

export function isEmbedBlock(block: NotionBlock): block is EmbedBlock {
  return block.type === "embed" && typeof block.embed?.url === "string";
}

export function findEmbed(
  blocks: NotionBlock[],
  matches: (url: string) => boolean,
): EmbedBlock | undefined {
  return blocks.filter(isEmbedBlock).find((block) => matches(block.embed.url));
}