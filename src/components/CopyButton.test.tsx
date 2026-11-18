import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CopyButton from './CopyButton'

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)

function setClipboard(
  writeText: ((value: string) => Promise<void>) | undefined,
) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

afterEach(() => {
  cleanup()
  if (originalClipboardDescriptor) {
    Object.defineProperty(
      navigator,
      'clipboard',
      originalClipboardDescriptor,
    )
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
})

describe('CopyButton', () => {
  it('copies the value and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)

    render(<CopyButton value="copy me" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy output' }))

    expect(await screen.findByText('Copied to clipboard.')).toBeTruthy()
    expect(writeText).toHaveBeenCalledWith('copy me')
  })

  it('announces when clipboard access is unavailable', async () => {
    setClipboard(undefined)

    render(<CopyButton value="copy me" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy output' }))

    expect(
      await screen.findByText('Clipboard access is unavailable in this browser.'),
    ).toBeTruthy()
  })

  it('announces clipboard write failures', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
    setClipboard(writeText)

    render(<CopyButton value="copy me" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy output' }))

    expect(
      await screen.findByText('Could not copy: Permission denied'),
    ).toBeTruthy()
  })
})
