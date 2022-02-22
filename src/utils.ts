export const findDefaultWeight = (clicks: number, tokens: number) => {
  return clicks + 1000 * tokens;
}