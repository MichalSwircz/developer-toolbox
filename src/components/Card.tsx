import { useId } from 'react'
import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}

function Card({
  action,
  children,
  className = '',
  description,
  icon,
  title,
}: CardProps) {
  const titleId = useId()
  const classes = [styles.card, className].filter(Boolean).join(' ')

  return (
    <section className={classes} aria-labelledby={titleId}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          <div className={styles.titleCopy}>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

export default Card
