import classNames from '@/utils/classNames';
import { RadioGroup } from '@headlessui/react';
import styles from './RadioOption.module.scss';

export interface CustomRadioOptionProps {
  key: string;
  value: string;
  content: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export default function RadioOption({ key, value, content, isSelected, onSelect }: CustomRadioOptionProps) {
  return (
    <RadioGroup.Option
      key={key}
      value={value}
      className={({ active }) =>
        classNames(
          active ? `${styles.activeBorderColor}` : 'border-gray-300',
          `relative block cursor-pointer rounded-lg border px-6 py-4 shadow-sm focus:outline-none`
        )
      }
      onClick={() => onSelect(key)}
    >
      <>
        <span className="flex items-center">
          <span className="flex flex-col text-sm">
            <RadioGroup.Label as="span" className="font-medium" dangerouslySetInnerHTML={{ __html: content }} />
          </span>
        </span>
        <span
          className={classNames(isSelected ? `${styles.selectedOption}` : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg')}
          aria-hidden="true"
        />
      </>
    </RadioGroup.Option>
  );
}
