import {
  Binary,
  Braces,
  ChevronRight,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import Base64Tool from '../features/base64/Base64Tool'
import JsonTool from '../features/json/JsonTool'
import JwtTool from '../features/jwt/JwtTool'
import UuidTool from '../features/uuid/UuidTool'
import styles from './App.module.css'

type ToolId = 'json' | 'jwt' | 'uuid' | 'base64'

interface ToolConfig {
  id: ToolId
  label: string
  shortLabel: string
  description: string
  navigationDescription: string
  Icon: LucideIcon
}

const tools: ToolConfig[] = [
  {
    id: 'json',
    label: 'JSON Formatter',
    shortLabel: 'JSON',
    description: 'Format, inspect, and validate JSON data.',
    navigationDescription: 'Format & validate',
    Icon: Braces,
  },
  {
    id: 'jwt',
    label: 'JWT Decoder',
    shortLabel: 'JWT',
    description: 'Decode token headers and payloads locally.',
    navigationDescription: 'Inspect a token',
    Icon: KeyRound,
  },
  {
    id: 'uuid',
    label: 'UUID Generator',
    shortLabel: 'UUID',
    description: 'Generate unique identifiers for your projects.',
    navigationDescription: 'Create identifiers',
    Icon: Fingerprint,
  },
  {
    id: 'base64',
    label: 'Base64 Encoder / Decoder',
    shortLabel: 'Base64',
    description: 'Encode text or decode Base64 strings.',
    navigationDescription: 'Encode & decode',
    Icon: Binary,
  },
]

function App() {
  const [activeToolId, setActiveToolId] = useState<ToolId>('json')
  const activeTool = tools.find((tool) => tool.id === activeToolId)

  if (!activeTool) {
    throw new Error(`Unknown developer tool: ${activeToolId}`)
  }

  const ActiveIcon = activeTool.Icon

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <Wrench size={19} strokeWidth={2} />
          </div>
          <div className={styles.brandCopy}>
            <span className={styles.brandOverline}>DEVTOOLS</span>
            <span className={styles.brandName}>Developer Toolbox</span>
          </div>
        </div>

        <div className={styles.navigationGroup}>
          <p className={styles.navigationHeading}>Your workspace</p>
          <nav className={styles.navigation} aria-label="Developer tools">
            {tools.map((tool) => {
              const Icon = tool.Icon
              const isActive = tool.id === activeTool.id

              return (
                <button
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${tool.label}: ${tool.description}`}
                  className={`${styles.navigationItem} ${isActive ? styles.navigationItemActive : ''}`}
                  key={tool.id}
                  onClick={() => setActiveToolId(tool.id)}
                  title={tool.label}
                  type="button"
                >
                  <span className={styles.navigationIcon} aria-hidden="true">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className={styles.navigationCopy}>
                    <span className={styles.navigationLabel}>{tool.label}</span>
                    <span className={styles.navigationDescription}>
                      {tool.navigationDescription}
                    </span>
                  </span>
                  {isActive && (
                    <ChevronRight
                      className={styles.navigationChevron}
                      size={16}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.privacyCard}>
            <span className={styles.privacyIcon} aria-hidden="true">
              <ShieldCheck size={17} />
            </span>
            <div>
              <p className={styles.privacyTitle}>Private by design</p>
              <p className={styles.privacyDescription}>
                Your data stays in this browser.
              </p>
            </div>
          </div>
          <p className={styles.sidebarVersion}>DEVELOPER TOOLBOX <span>•</span> 1.0</p>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {activeTool.shortLabel}
            </span>
          </nav>
          <div className={styles.localStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            <LockKeyhole size={14} aria-hidden="true" />
            <span>Runs locally</span>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div className={styles.pageTitleGroup}>
              <div className={styles.toolIcon} aria-hidden="true">
                <ActiveIcon size={21} strokeWidth={1.8} />
              </div>
              <div>
                <p className={styles.pageEyebrow}>DEVELOPER TOOLS</p>
                <h1>{activeTool.label}</h1>
                <p className={styles.pageDescription}>{activeTool.description}</p>
              </div>
            </div>
            <span className={styles.previewBadge}>
              <span className={styles.previewDot} aria-hidden="true" />
              Ready to use
            </span>
          </div>

          {activeTool.id === 'json' ? (
            <JsonTool />
          ) : activeTool.id === 'jwt' ? (
            <JwtTool />
          ) : activeTool.id === 'uuid' ? (
            <UuidTool />
          ) : (
            <Base64Tool />
          )}

          <div className={styles.workspaceNote}>
            <LockKeyhole size={14} aria-hidden="true" />
            <p>
              <strong>Local-first tools.</strong> Your input stays on this device
              and is never sent to a server.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
