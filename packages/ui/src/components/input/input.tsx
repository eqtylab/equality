import * as React from 'react';
import { CircleAlert } from 'lucide-react';

import styles from '@/components/input/input.module.css';
import { MotionCollapsibleContent } from '@/components/motion-collapsible/motion-collapsible';
import { cn } from '@/lib/utils';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> & {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  helpText?: React.ReactNode;
  errorText?: React.ReactNode | string[];
  containerClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type,
      prefix,
      suffix,
      helpText,
      errorText,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const helpTextId = `${id}-help-text`;
    const errorTextId = `${id}-error-text`;

    // a validator that reports several problems at once gets a row each, deduped
    const errorList =
      Array.isArray(errorText) &&
      errorText.every((message): message is string => typeof message === 'string')
        ? [...new Set(errorText.filter((message) => !!message))]
        : null;
    const hasErrorText = errorList ? errorList.length > 0 : !!errorText;

    // errorText drives the error state, but a caller can still mark the field invalid on its own
    const isMarkedInvalid =
      ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== 'false';
    const hasError = hasErrorText || isMarkedInvalid;

    // the error takes the help text's place rather than stacking under it, so the field
    // never shows two competing messages
    const showHelpText = !!helpText && !hasErrorText;

    const describedBy =
      [ariaDescribedBy, showHelpText && helpTextId, hasErrorText && errorTextId]
        .filter(Boolean)
        .join(' ') || undefined;

    const errorIcon = <CircleAlert className={styles['input-error-icon']} aria-hidden="true" />;

    // role="alert" announces the message on insert, so no input carries a standing live region
    const errorMessage =
      errorList && errorList.length > 1 ? (
        <ul id={errorTextId} role="alert" className={styles['input-error-list']}>
          {errorList.map((message) => (
            <li key={message} className={styles['input-error-text']}>
              {errorIcon}
              <span>{message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p id={errorTextId} role="alert" className={styles['input-error-text']}>
          {errorIcon}
          <span>{errorList ? errorList[0] : errorText}</span>
        </p>
      );

    return (
      <div className={cn(styles['input-container'], containerClassName)}>
        <div
          className={cn(
            styles['input-wrapper'],
            hasError && styles['input-wrapper--error'],
            className
          )}
        >
          {prefix && <span className={styles['input-prefix']}>{prefix}</span>}
          <input
            type={type}
            className={styles['input-element']}
            ref={ref}
            aria-invalid={isMarkedInvalid ? ariaInvalid : hasErrorText || undefined}
            aria-describedby={describedBy}
            {...props}
          />
          {suffix && <span className={styles['input-suffix']}>{suffix}</span>}
        </div>

        {/* help text already holds the slot open, so the error swaps straight in; on its own
            it collapses in and out instead, which keeps the layout from jumping */}
        {helpText ? (
          hasErrorText && errorMessage
        ) : (
          <MotionCollapsibleContent isOpen={hasErrorText}>{errorMessage}</MotionCollapsibleContent>
        )}

        {showHelpText && (
          <p id={helpTextId} className={styles['input-help-text']}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
