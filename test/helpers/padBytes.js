export default function formatHex (str, count) {
  const cutStr = str.slice(2)
  const pad = cutStr.padStart(count * 2, '0')
  return '0x'.concat(pad)
}
