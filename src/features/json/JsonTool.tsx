import {
  Braces,
  Check,
  CircleCheck,
  Eraser,
  FileCode2,
  Minimize2,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CopyButton from '../../components/CopyButton'
import TextArea from '../../components/TextArea'
import styles from './JsonTool.module.css'
import {
  formatJson,
  minifyJson,
  validateJson,
} from './jsonUtils'
import type {
  JsonIndentation,
  JsonTransformResult,
} from './jsonUtils'

const exampleJson = `{
  "project": "Developer Toolbox",
  "version": 1,
  "features": ["format", "validate", "minify"],
  "settings": {
    "indentation": 2,
    "theme": "dark"
  }
}`

function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentation, setIndentation] = useState<JsonIndentation>(2)
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)

  const clearResults = () => {
    setOutput('')
    setError('')
    setIsValid(false)
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value)
    clearResults()
  }

  const handleExample = () => {
    setInput(exampleJson)
    clearResults()
  }

  const handleClear = () => {
    setInput('')
    clearResults()
  }

  const handleTransform = (result: JsonTransformResult) => {
    if (result.ok) {
      setOutput(result.output)
      setError('')
      setIsValid(false)
      return
    }

    setOutput('')
    setError(result.error)
    setIsValid(false)
  }

  const handleFormat = () => {
    handleTransform(formatJson(input, indentation))
  }

  const handleMinify = () => {
    handleTransform(minifyJson(input))
  }

  const handleValidate = () => {
    const result = validateJson(input)
    setOutput('')
    setError(result.valid ? '' : result.error)
    setIsValid(result.valid)
  }

  const handleIndentationChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.currentTarget.value
    setIndentation(value === 'tab' ? '\t' : value === '4' ? 4 : 2)
  }

  const isEmpty = input.trim() === ''

  return (
    <div className={styles.editorGrid}>
      <Card
        className={styles.inputCard}
        title="JSON input"
        description="Paste JSON or load an example to get started."
        icon={<Braces size={16} aria-hidden="true" />}
        action={
          <div className={styles.headerActions}>
            <Button
              leadingIcon={<FileCode2 size={14} aria-hidden="true" />}
              onClick={handleExample}
              variant="ghost"
              aria-label="Load example JSON"
            >
              Example
            </Button>
            <Button
              disabled={input === '' && output === '' && !error}
              leadingIcon={<Eraser size={14} aria-hidden="true" />}
              onClick={handleClear}
              variant="ghost"
              aria-label="Clear JSON input and results"
            >
              Clear
            </Button>
          </div>
        }
      >
        <TextArea
          id="json-input"
          label="JSON source"
          hint="JSON objects, arrays, and primitive values are supported. Maximum input: 1 MiB of UTF-8 text."
          error={error || undefined}
          onChange={handleInputChange}
          placeholder={'{\n  "message": "Paste JSON or load an example"\n}'}
          rows={14}
          spellCheck={false}
          value={input}
          className={styles.inputArea}
        />
        <div className={styles.optionsRow}>
          <label className={styles.indentationLabel} htmlFor="json-indentation">
            Indentation
          </label>
          <select
            className={styles.indentationSelect}
            id="json-indentation"
            onChange={handleIndentationChange}
            value={indentation === '\t' ? 'tab' : indentation}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value="tab">Tab</option>
          </select>
          <span className={styles.optionHint}>Used when formatting</span>
        </div>
        <div className={styles.actions}>
          <Button
            disabled={isEmpty}
            leadingIcon={<Sparkles size={15} aria-hidden="true" />}
            onClick={handleFormat}
            variant="primary"
          >
            Format
          </Button>
          <Button
            disabled={isEmpty}
            leadingIcon={<Minimize2 size={15} aria-hidden="true" />}
            onClick={handleMinify}
            variant="secondary"
          >
            Minify
          </Button>
          <Button
            disabled={isEmpty}
            leadingIcon={<Check size={15} aria-hidden="true" />}
            onClick={handleValidate}
            variant="ghost"
          >
            Validate
          </Button>
        </div>
      </Card>

      <Card
        className={styles.outputCard}
        title="Result"
        description="Formatted or minified JSON appears here."
        icon={<Braces size={16} aria-hidden="true" />}
        action={<CopyButton value={output} label="Copy JSON result" />}
      >
        {output ? (
          <pre className={styles.output} aria-label="JSON result" tabIndex={0}>
            {output}
          </pre>
        ) : isValid ? (
          <div className={styles.validationState} role="status">
            <span className={styles.validationIcon} aria-hidden="true">
              <CircleCheck size={19} />
            </span>
            <p className={styles.emptyTitle}>Your JSON is valid</p>
            <p className={styles.emptyDescription}>
              The input is syntactically correct and ready to use.
            </p>
          </div>
        ) : (
          <div className={styles.emptyState} aria-live="polite">
            <span className={styles.emptyIcon} aria-hidden="true">
              <Braces size={20} strokeWidth={1.7} />
            </span>
            <p className={styles.emptyTitle}>
              {error
                ? 'Fix the input to continue'
                : isEmpty
                  ? 'No input yet'
                  : 'Ready when you are'}
            </p>
            <p className={styles.emptyDescription}>
              {error
                ? 'Correct the JSON syntax error, then try again.'
                : isEmpty
                  ? 'Add JSON or load the example, then choose an action.'
                  : 'Format, minify, or validate your JSON to see a result.'}
            </p>
            <span className={styles.emptyHint}>
              {error
                ? 'Input needs attention'
                : isEmpty
                  ? 'Waiting for JSON'
                  : 'No result yet'}
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}

export default JsonTool
