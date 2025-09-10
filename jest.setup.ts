import '@testing-library/jest-dom';
// Polyfill TextEncoder/TextDecoder for libraries that expect them in JSDOM
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore - augment global for test runtime
if (!(global as any).TextEncoder) {
  // @ts-ignore
  (global as any).TextEncoder = TextEncoder;
}
// @ts-ignore - augment global for test runtime
if (!(global as any).TextDecoder) {
  // @ts-ignore
  (global as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}
