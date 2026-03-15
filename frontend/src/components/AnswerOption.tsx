import clsx from 'clsx';

interface Props {
  label: string;
  text: string;
  state: 'default' | 'selected' | 'correct' | 'wrong';
  onClick?: () => void;
  disabled?: boolean;
}

export default function AnswerOption({ label, text, state, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 flex items-start gap-4 group',
        {
          'border-gray-200 bg-white hover:border-gray-400 active:scale-[0.99]':
            state === 'default' && !disabled,
          'border-2 border-brand-700 bg-brand-50 text-brand-900': state === 'selected',
          'border-2 border-green-600 bg-green-50 text-green-900': state === 'correct',
          'border-2 border-red-500 bg-red-50 text-red-900': state === 'wrong',
          'opacity-60 cursor-not-allowed': disabled && state === 'default',
        }
      )}
    >
      <span className={clsx(
        'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border',
        {
          'border-gray-300 text-gray-500 group-hover:border-gray-500': state === 'default',
          'border-brand-700 bg-brand-700 text-white': state === 'selected',
          'border-green-600 bg-green-600 text-white': state === 'correct',
          'border-red-500 bg-red-500 text-white': state === 'wrong',
        }
      )}>
        {label}
      </span>
      <span className="text-sm leading-relaxed pt-0.5">{text}</span>
    </button>
  );
}
