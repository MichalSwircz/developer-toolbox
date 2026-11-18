import { Fingerprint, RefreshCw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CopyButton from '../../components/CopyButton'
import styles from './UuidTool.module.css'
import {
  DEFAULT_UUID_COUNT,
  MAX_UUID_COUNT,
  MIN_UUID_COUNT,
  generateUuids,
  validateUuidCount,
} from './uuidUtils'

function UuidTool() {
  const [countInput, setCountInput] = useState(String(DEFAULT_UUID_COUNT))
  const [uuids, setUuids] = useState<string[]>([])
  const [error, setError] = useState('')
  const countValidation = validateUuidCount(countInput)
  const hasUuids = uuids.length > 0

  const handleCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCountInput(event.currentTarget.value)
    setUuids([])
    setError('')
  }

  const handleGenerate = () => {
    if (!countValidation.valid) {
      setUuids([])
      setError(countValidation.error)
      return
    }

    const result = generateUuids(countValidation.count)
    if (!result.ok) {
      setUuids([])
      setError(result.error)
      return
    }

    setUuids(result.uuids)
    setError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleGenerate()
  }

  return (
    <div className={styles.layout}>
      <Card
        className={styles.settingsCard}
        title="Generate UUIDs"
        description="Create cryptographically secure version 4 identifiers."
        icon={<Fingerprint size={16} aria-hidden="true" />}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.countField}>
            <label className={styles.label} htmlFor="uuid-count">
              Quantity
            </label>
            <input
              aria-describedby={
                countValidation.valid ? 'uuid-count-hint' : 'uuid-count-error'
              }
              aria-invalid={!countValidation.valid}
              className={styles.countInput}
              id="uuid-count"
              max={MAX_UUID_COUNT}
              min={MIN_UUID_COUNT}
              onChange={handleCountChange}
              required
              step="1"
              type="number"
              value={countInput}
            />
            <p
              className={
                countValidation.valid ? styles.fieldHint : styles.fieldError
              }
              id={
                countValidation.valid ? 'uuid-count-hint' : 'uuid-count-error'
              }
              role={countValidation.valid ? undefined : 'alert'}
            >
              {countValidation.valid
                ? `Choose between ${MIN_UUID_COUNT} and ${MAX_UUID_COUNT} UUIDs per batch.`
                : countValidation.error}
            </p>
          </div>
          {error && (
            <p className={styles.generationError} role="alert">
              {error}
            </p>
          )}
          <Button
            className={styles.generateButton}
            disabled={!countValidation.valid}
            leadingIcon={<Fingerprint size={16} aria-hidden="true" />}
            type="submit"
            variant="primary"
          >
            Generate {countValidation.valid ? countValidation.count : ''} UUIDs
          </Button>
        </form>
        <div className={styles.securityHint}>
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Generated locally with the Web Crypto API.</span>
        </div>
      </Card>

      <Card
        className={styles.resultsCard}
        title="Your UUIDs"
        description={
          hasUuids
            ? `${uuids.length} identifier${uuids.length === 1 ? '' : 's'} generated.`
            : 'Generated identifiers will appear here.'
        }
        icon={<Fingerprint size={16} aria-hidden="true" />}
        action={
          hasUuids ? (
            <div className={styles.resultActions}>
              <CopyButton
                value={uuids.join('\n')}
                label="Copy all UUIDs"
              />
              <Button
                aria-label="Regenerate UUIDs"
                leadingIcon={<RefreshCw size={14} aria-hidden="true" />}
                onClick={handleGenerate}
                variant="ghost"
              >
                Regenerate
              </Button>
            </div>
          ) : undefined
        }
      >
        {hasUuids ? (
          <ol className={styles.uuidList} aria-label="Generated UUIDs">
            {uuids.map((uuid, index) => (
              <li className={styles.uuidItem} key={uuid}>
                <span className={styles.uuidIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <code className={styles.uuidValue}>{uuid}</code>
                <CopyButton
                  value={uuid}
                  label={`Copy UUID ${index + 1}`}
                />
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.emptyState} aria-live="polite">
            <span className={styles.emptyIcon} aria-hidden="true">
              <Fingerprint size={21} strokeWidth={1.7} />
            </span>
            <p className={styles.emptyTitle}>Ready to generate</p>
            <p className={styles.emptyDescription}>
              Select a quantity and generate your first batch of UUIDs.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default UuidTool
