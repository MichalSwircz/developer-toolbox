import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('App', () => {
  it('renders the tool workspace with the JSON tool selected', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'JSON Formatter' })).toBeTruthy()
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: /JSON Formatter/ })
        .getAttribute('aria-current'),
    ).toBe('page')
  })

  it('changes the active tool when navigation is selected', () => {
    render(<App />)

    fireEvent.click(
      screen.getByRole('button', { name: /Base64 Encoder \/ Decoder/ }),
    )

    expect(
      screen.getByRole('heading', { name: 'Base64 Encoder / Decoder' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: /Base64 Encoder \/ Decoder/ })
        .getAttribute('aria-current'),
    ).toBe('page')
  })

  it('loads and formats the included JSON example', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Load example JSON' }))
    fireEvent.click(screen.getByRole('button', { name: 'Format' }))

    expect(screen.getByLabelText('JSON result').textContent).toContain(
      '"project": "Developer Toolbox"',
    )
  })

  it('shows a parse error and clears it with the clear action', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: 'JSON source' }), {
      target: { value: '{"invalid":}' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }))

    expect(screen.getByRole('alert').textContent).not.toBe('')

    fireEvent.click(
      screen.getByRole('button', { name: 'Clear JSON input and results' }),
    )

    expect(screen.queryByRole('alert')).toBeNull()
    expect(
      (screen.getByRole('textbox', { name: 'JSON source' }) as HTMLTextAreaElement)
        .value,
    ).toBe('')
    expect(screen.getByText('No input yet')).toBeTruthy()
  })

  it('can clear whitespace-only JSON input', () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: 'JSON source' }), {
      target: { value: ' \n\t ' },
    })
    const clearButton = screen.getByRole('button', {
      name: 'Clear JSON input and results',
    })

    expect(clearButton.hasAttribute('disabled')).toBe(false)
    fireEvent.click(clearButton)
    expect(
      (screen.getByRole('textbox', { name: 'JSON source' }) as HTMLTextAreaElement)
        .value,
    ).toBe('')
  })

  it('can clear whitespace-only JWT input', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /JWT Decoder/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'JWT' }), {
      target: { value: ' \n\t ' },
    })
    const clearButton = screen.getByRole('button', {
      name: 'Clear JWT input and result',
    })

    expect(clearButton.hasAttribute('disabled')).toBe(false)
    fireEvent.click(clearButton)
    expect(
      (screen.getByRole('textbox', { name: 'JWT' }) as HTMLTextAreaElement).value,
    ).toBe('')
  })

  it('decodes the example JWT and warns that its signature is unverified', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /JWT Decoder/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Load example JWT' }))
    fireEvent.click(screen.getByRole('button', { name: 'Decode token' }))

    expect(screen.getByLabelText('Decoded JWT header JSON').textContent).toContain(
      '"alg": "HS256"',
    )
    expect(screen.getByText('Not expired')).toBeTruthy()
    expect(screen.getByText(/does not verify the token signature/i)).toBeTruthy()
  })

  it('generates the selected number of UUIDs with copy and regenerate controls', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /UUID Generator/ }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantity' }), {
      target: { value: '3' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Generate 3 UUIDs' }))

    const uuidList = screen.getByRole('list', { name: 'Generated UUIDs' })
    const firstBatch = within(uuidList)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('code')?.textContent)

    expect(firstBatch).toHaveLength(3)
    expect(firstBatch.every((uuid) => uuid && /-4[0-9a-f]{3}-/i.test(uuid))).toBe(
      true,
    )
    expect(screen.getByRole('button', { name: 'Copy all UUIDs' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Copy UUID 1' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate UUIDs' }))

    const regeneratedList = screen.getByRole('list', {
      name: 'Generated UUIDs',
    })
    const secondBatch = within(regeneratedList)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('code')?.textContent)

    expect(secondBatch).toHaveLength(3)
    expect(secondBatch).not.toEqual(firstBatch)
  })

  it('encodes, swaps, decodes, and clears Base64 text', () => {
    render(<App />)

    fireEvent.click(
      screen.getByRole('button', { name: /Base64 Encoder \/ Decoder/ }),
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Text or Base64 data' }), {
      target: { value: 'Hello, world!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Encode to Base64' }))

    expect(screen.getByLabelText('Base64 result').textContent).toBe(
      'SGVsbG8sIHdvcmxkIQ==',
    )
    expect(screen.getByRole('button', { name: 'Copy Base64 result' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Swap input and output' }))
    expect(
      (screen.getByRole('textbox', { name: 'Text or Base64 data' }) as HTMLTextAreaElement)
        .value,
    ).toBe('SGVsbG8sIHdvcmxkIQ==')

    fireEvent.click(screen.getByRole('button', { name: 'Decode from Base64' }))
    expect(screen.getByLabelText('Decoded text result').textContent).toBe(
      'Hello, world!',
    )
    expect(
      screen.getByRole('button', { name: 'Copy decoded text result' }),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Clear Base64 input and results' }),
    )
    expect(
      (screen.getByRole('textbox', { name: 'Text or Base64 data' }) as HTMLTextAreaElement)
        .value,
    ).toBe('')
    expect(screen.getByText('No input yet')).toBeTruthy()
  })

  it('shows a useful error when Base64 input is malformed', () => {
    render(<App />)

    fireEvent.click(
      screen.getByRole('button', { name: /Base64 Encoder \/ Decoder/ }),
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Text or Base64 data' }), {
      target: { value: '%%%not-base64%%%' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Decode from Base64' }))

    expect(screen.getByRole('alert').textContent).toBe(
      'Enter valid Base64 data to decode.',
    )
  })
})
