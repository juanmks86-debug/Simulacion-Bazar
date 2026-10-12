import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom no implementa scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
