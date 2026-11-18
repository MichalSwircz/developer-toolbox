import {
  ArrowLeftRight,
  Binary,
  Eraser,
  FileCode2,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CopyButton from '../../components/CopyButton'
import TextArea from '../../components/TextArea'
import styles from './Base64Tool.module.css'
import {
  decodeBase64ToText,
  encodeTextToBase64,
} from './base64Utils'

const exampleText = 'Zażółć gęślą jaźń — Unicode ✓'

function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [resultType, setResultType] = useState<'encoded' | 'decoded' | null>(
    null,
  )
  const [error, setError] = useState('')

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value)
    setOutput(null)
    setResultType(null)
    setError('')
  }

  const handleExample = () => {
    setInput(exampleText)
    setOutput(null)
    setResultType(null)
    setError('')
  }

  const handleClear = () => {
    setInput('')
    setOutput(null)
    setResultType(null)
    setError('')
  }

  const handleEncode = () => {
    const result = encodeTextToBase64(input)
    if (result.ok) {
      setOutput(result.value)
      setResultType('encoded')
      setError('')
      return
    }

    setOutput(null)
    setResultType(null)
    setError(result.error)
  }

  const handleDecode = () => {
    const result = decodeBase64ToText(input)
    if (result.ok) {
      setOutput(result.value)
      setResultType('decoded')
      setError('')
      return
    }

    setOutput(null)
    setResultType(null)
    setError(result.error)
  }

  const handleSwap = () => {
    if (output === null || resultType === null) {
      return
    }

    setInput(output)
    setOutput(input)
    setResultType(resultType === 'encoded' ? 'decoded' : 'encoded')
    setError('')
  }

  const isEmpty = input.length === 0
  const isClearDisabled = isEmpty && output === null && error === ''

  return (
    <div className={styles.editorGrid}>
      <Card
        className={styles.inputCard}
        title="Text or Base64 input"
        description="Enter text to encode or Base64 data to decode."
        icon={<Binary size={16} aria-hidden="true" />}
        action={
          <div className={styles.headerActions}>
            <Button
              leadingIcon={<FileCode2 size={14} aria-hidden="true" />}
              onClick={handleExample}
              variant="ghost"
              aria-label="Load example text"
            >
              Example
            </Button>
            <Button
              disabled={isClearDisabled}
              leadingIcon={<Eraser size={14} aria-hidden="true" />}
              onClick={handleClear}
              variant="ghost"
              aria-label="Clear Base64 input and results"
            >
              Clear
            </Button>
          </div>
        }
      >
        <TextArea
          id="base64-input"
          label="Text or Base64 data"
          hint="Uses UTF-8; Base64 whitespace is ignored. Maximum input: 1 MiB of UTF-8 text."
          error={error || undefined}
          onChange={handleInputChange}
          placeholder="Enter text or a Base64 string here..."
          rows={14}
          spellCheck={false}
          value={input}
          className={styles.inputArea}
        />
        <div className={styles.actions}>
          <Button
            disabled={isEmpty}
            leadingIcon={<Sparkles size={15} aria-hidden="true" />}
            onClick={handleEncode}
            variant="primary"
          >
            Encode to Base64
          </Button>
          <Button
            disabled={isEmpty}
            leadingIcon={<Binary size={15} aria-hidden="true" />}
            onClick={handleDecode}
            variant="secondary"
          >
            Decode from Base64
          </Button>
        </div>
      </Card>

      <Card
        className={styles.outputCard}
        title="Result"
        description={
          resultType === 'encoded'
            ? 'Base64-encoded UTF-8 data.'
            : resultType === 'decoded'
              ? 'Decoded UTF-8 text.'
              : 'Encoded or decoded text appears here.'
        }
        icon={<Binary size={16} aria-hidden="true" />}
        action={
          <div className={styles.resultActions}>
            <Button
              disabled={output === null || resultType === null}
              leadingIcon={<ArrowLeftRight size={14} aria-hidden="true" />}
              onClick={handleSwap}
              variant="ghost"
              aria-label="Swap input and output"
            >
              Swap
            </Button>
            <CopyButton
              value={output ?? ''}
              label={`Copy ${resultType === 'decoded' ? 'decoded text' : 'Base64'} result`}
            />
          </div>
        }
      >
        {output !== null && output.length > 0 ? (
          <pre
            className={styles.output}
            aria-label={resultType === 'decoded' ? 'Decoded text result' : 'Base64 result'}
            tabIndex={0}
          >
            {output}
          </pre>
        ) : output !== null ? (
          <div className={styles.emptyState} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">
              <Binary size={20} strokeWidth={1.7} />
            </span>
            <p className={styles.emptyTitle}>The result is empty</p>
            <p className={styles.emptyDescription}>
              The input contains no text to display.
            </p>
          </div>
        ) : (
          <div className={styles.emptyState} aria-live="polite">
            <span className={styles.emptyIcon} aria-hidden="true">
              <Binary size={20} strokeWidth={1.7} />
            </span>
            <p className={styles.emptyTitle}>
              {error ? 'Check the input' : isEmpty ? 'No input yet' : 'Ready when you are'}
            </p>
            <p className={styles.emptyDescription}>
              {error
                ? 'Correct the input and try encoding or decoding again.'
                : 'Enter data or load the example, then choose an action.'}
            </p>
            <span className={styles.emptyHint}>
              {error ? 'Input needs attention' : 'Waiting for text'}
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Base64Tool
