import type { TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import styles from './TextArea.module.css'

interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string
  label: string
  hint?: string
  error?: string
}

function TextArea({
  className = '',
  error,
  hint,
  id,
  label,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: TextAreaProps) {
  const hintId = useId()
  const errorId = useId()
  const describedBy = [
    ariaDescribedBy,
    hint && !error && hintId,
    error && errorId,
  ]
    .filter(Boolean)
    .join(' ')
  const classes = [styles.textarea, className].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : ariaInvalid}
        className={classes}
        id={id}
      />
      {hint && !error && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextArea
