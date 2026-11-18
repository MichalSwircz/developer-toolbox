import { AlertCircle, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import Button from './Button'
import styles from './CopyButton.module.css'

interface CopyButtonProps {
  value: string
  label?: string
  disabled?: boolean
}

type FeedbackKind = 'success' | 'error' | ''

function CopyButton({
  disabled = false,
  label = 'Copy output',
  value,
}: CopyButtonProps) {
  const [feedback, setFeedback] = useState('')
  const [feedbackKind, setFeedbackKind] = useState<FeedbackKind>('')
  const [copied, setCopied] = useState(false)
  const isDisabled = disabled || value.length === 0

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) {
      setCopied(false)
      setFeedback('Clipboard access is unavailable in this browser.')
      setFeedbackKind('error')
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setFeedback('Copied to clipboard.')
      setFeedbackKind('success')
      window.setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      setCopied(false)
      setFeedbackKind('error')
      setFeedback(
        error instanceof Error
          ? `Could not copy: ${error.message}`
          : 'Could not copy. Please try again.',
      )
    }
  }

  return (
    <div className={styles.copyControl}>
      <Button
        aria-label={label}
        disabled={isDisabled}
        leadingIcon={
          copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )
        }
        onClick={handleCopy}
        variant="ghost"
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <span
        className={
          feedbackKind === 'error' ? styles.feedbackError : styles.feedback
        }
        role="status"
        aria-live="polite"
      >
        {feedback}
      </span>
      {feedbackKind === 'error' && (
        <AlertCircle
          className={styles.feedbackIcon}
          size={13}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default CopyButton
