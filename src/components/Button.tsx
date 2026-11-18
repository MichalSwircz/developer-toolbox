import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leadingIcon?: ReactNode
}

function Button({
  children,
  className = '',
  leadingIcon,
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={type} {...props}>
      {leadingIcon && (
        <span className={styles.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
    </button>
  )
}

export default Button
