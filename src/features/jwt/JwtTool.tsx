import {
  AlertTriangle,
  CalendarClock,
  Clock3,
  FileCode2,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CopyButton from '../../components/CopyButton'
import TextArea from '../../components/TextArea'
import styles from './JwtTool.module.css'
import { decodeJwt } from './jwtUtils'
import type { DecodedJwt, JwtDecodeResult, JwtTimestampClaim } from './jwtUtils'

const exampleToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0b29sYm94LXVzZXIiLCJuYW1lIjoiQWxleCBEZXYiLCJpYXQiOjE3MzU2ODk2MDAsIm5iZiI6MTczNTY4OTYwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.c2FtcGxlLXNpZ25hdHVyZQ'

interface TimestampCardProps {
  title: string
  description: string
  claim: JwtTimestampClaim | null
  expirationStatus?: boolean | null
}

function TimestampCard({
  claim,
  description,
  expirationStatus,
  title,
}: TimestampCardProps) {
  const expirationLabel =
    expirationStatus === null
      ? claim?.kind === 'invalid'
        ? 'Invalid claim'
        : 'No exp claim'
      : expirationStatus
        ? 'Expired'
        : 'Not expired'

  return (
    <Card
      className={styles.claimCard}
      title={title}
      description={description}
      icon={<CalendarClock size={16} aria-hidden="true" />}
    >
      {claim === null ? (
        <p className={styles.claimMissing}>Not present in token</p>
      ) : claim.kind === 'invalid' ? (
        <div className={styles.claimInvalid}>
          <AlertTriangle size={14} aria-hidden="true" />
          <p>{claim.error}</p>
        </div>
      ) : (
        <div className={styles.claimValue}>
          <time className={styles.claimDate} dateTime={claim.iso}>
            {claim.iso}
          </time>
          <span className={styles.claimSeconds}>
            {claim.seconds} seconds since Unix epoch
          </span>
        </div>
      )}
      {expirationStatus !== undefined && (
        <span
          className={`${styles.expirationStatus} ${
            expirationStatus === true
              ? styles.expired
              : expirationStatus === false
                ? styles.notExpired
                : styles.unknownExpiration
          }`}
        >
          {expirationLabel}
        </span>
      )}
    </Card>
  )
}

interface JsonSectionProps {
  title: string
  description: string
  value: string
}

function JsonSection({ description, title, value }: JsonSectionProps) {
  const sectionName = title.toLowerCase()

  return (
    <Card
      className={styles.jsonSection}
      title={title}
      description={description}
      icon={<FileCode2 size={16} aria-hidden="true" />}
      action={<CopyButton value={value} label={`Copy JWT ${sectionName}`} />}
    >
      <pre
        aria-label={`Decoded JWT ${sectionName} JSON`}
        className={styles.jsonOutput}
        tabIndex={0}
      >
        {value}
      </pre>
    </Card>
  )
}

function JwtTool() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState('')

  const clearResult = () => {
    setDecoded(null)
    setError('')
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value)
    clearResult()
  }

  const handleLoadExample = () => {
    setInput(exampleToken)
    clearResult()
  }

  const handleClear = () => {
    setInput('')
    clearResult()
  }

  const handleDecode = () => {
    const result: JwtDecodeResult = decodeJwt(input, Date.now() / 1000)
    if (!result.ok) {
      setDecoded(null)
      setError(result.error)
      return
    }

    setDecoded(result.decoded)
    setError('')
  }

  const isEmpty = input.trim() === ''

  return (
    <div className={styles.jwtTool}>
      <Card
        className={styles.tokenCard}
        title="Encoded token"
        description="Paste a compact JWT to decode its header and payload."
        icon={<FileCode2 size={16} aria-hidden="true" />}
        action={
          <div className={styles.headerActions}>
            <Button
              aria-label="Load example JWT"
              leadingIcon={<FileCode2 size={14} aria-hidden="true" />}
              onClick={handleLoadExample}
              variant="ghost"
            >
              Example
            </Button>
            <Button
              aria-label="Clear JWT input and result"
              disabled={input === '' && decoded === null && error === ''}
              leadingIcon={<Trash2 size={14} aria-hidden="true" />}
              onClick={handleClear}
              variant="ghost"
            >
              Clear
            </Button>
          </div>
        }
      >
        <TextArea
          id="jwt-input"
          label="JWT"
          hint="Token data is decoded locally. Maximum input: 1 MiB of UTF-8 text."
          error={error || undefined}
          onChange={handleInputChange}
          placeholder="Paste a three-part JWT here..."
          rows={4}
          spellCheck={false}
          value={input}
          className={styles.tokenInput}
        />
        <div className={styles.decodeActions}>
          <Button
            disabled={isEmpty}
            leadingIcon={<FileCode2 size={15} aria-hidden="true" />}
            onClick={handleDecode}
            variant="primary"
          >
            Decode token
          </Button>
          <span className={styles.actionHint}>No network requests are made.</span>
        </div>
      </Card>

      <aside className={styles.securityNotice} aria-label="JWT security notice">
        <span className={styles.securityIcon} aria-hidden="true">
          <ShieldAlert size={17} />
        </span>
        <p>
          <strong>Decoding is not verification.</strong> This tool does not
          verify the token signature or establish the token&apos;s authenticity.
          Treat decoded claims as untrusted.
        </p>
      </aside>

      {decoded && (
        <section className={styles.decodedResult} aria-label="Decoded JWT">
          <div className={styles.claimsGrid}>
            <TimestampCard
              title="Expiration (exp)"
              description="When the token expires."
              claim={decoded.expiration}
              expirationStatus={decoded.isExpired}
            />
            <TimestampCard
              title="Issued at (iat)"
              description="When the token was issued."
              claim={decoded.issuedAt}
            />
            <TimestampCard
              title="Not before (nbf)"
              description="When the token becomes valid."
              claim={decoded.notBefore}
            />
          </div>
          <div className={styles.sectionsGrid}>
            <JsonSection
              title="Header"
              description="Decoded JWT header."
              value={decoded.headerJson}
            />
            <JsonSection
              title="Payload"
              description="Decoded JWT claims."
              value={decoded.payloadJson}
            />
          </div>
          <p className={styles.signatureNote}>
            <Clock3 size={14} aria-hidden="true" />
            Signature data was not checked.
          </p>
        </section>
      )}
    </div>
  )
}

export default JwtTool
