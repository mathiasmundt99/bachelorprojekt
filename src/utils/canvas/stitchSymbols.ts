const STITCH_SYMBOLS = Array.from("●○■□◆◇▲△▼▽◀▶★☆✚✖✳✿✦✧⊕⊗⊙⊞⊠♠♣♥♦");

export function createStitchSymbolMap(
  dmcCodeByHex: ReadonlyMap<string, string>,
): ReadonlyMap<string, string> {
  const colors = [...dmcCodeByHex.entries()].sort(
    ([hexA, codeA], [hexB, codeB]) =>
      codeA.localeCompare(codeB, undefined, {
        numeric: true,
      }) || hexA.localeCompare(hexB),
  );

  return new Map(
    colors.map(([hex], index) => {
      const symbolIndex = index % STITCH_SYMBOLS.length;
      const symbol = STITCH_SYMBOLS[symbolIndex];

      return [hex.toLowerCase(), symbol];
    }),
  );
}

export function getStitchSymbol(
  hex: string | null,
  symbols: ReadonlyMap<string, string>,
): string {
  if (!hex) return "";

  return symbols.get(hex.toLowerCase()) ?? "?";
}
