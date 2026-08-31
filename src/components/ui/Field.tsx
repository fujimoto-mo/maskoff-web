import type { ReactNode } from "react";

/** input / select / textarea に付ける共通クラス（dipsy の入力欄実測） */
export const INPUT_CLASS =
  "w-full rounded-input border-[1.5px] border-transparent bg-surface-alt px-[15px] py-4 text-[14px] text-fg placeholder:text-placeholder-text transition-colors focus:border-fg focus:outline-none aria-invalid:border-required max-tab:text-[16px]";

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  /** エラー文。id は `${htmlFor}-error` で出力するので input 側の aria-describedby に渡す */
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
};

/**
 * @example
 * <Field label="お名前" htmlFor="name" required error={errors.name}>
 *   <input id="name" name="name" className={INPUT_CLASS} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
 * </Field>
 */
export default function Field({ label, htmlFor, required = false, error, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-fg">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-required">
            *
          </span>
        )}
      </label>
      {children}
      {hint}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-caption text-required">
          {error}
        </p>
      )}
    </div>
  );
}
