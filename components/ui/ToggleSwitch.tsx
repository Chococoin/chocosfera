'use client';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

const colorClasses = {
  purple: 'peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600',
  blue: 'peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600',
  green: 'peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-600',
  orange: 'peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:bg-orange-600',
};

export function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  color = 'purple',
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      {label && (
        <label htmlFor={id} className="text-gray-900 dark:text-white font-medium cursor-pointer">
          {label}
        </label>
      )}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 ${colorClasses[color]} rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
      </label>
    </div>
  );
}

interface ToggleSwitchListProps {
  items: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }[];
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

export function ToggleSwitchList({ items, color = 'purple' }: ToggleSwitchListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <ToggleSwitch
            id={item.id}
            label={item.label}
            checked={item.checked}
            onChange={item.onChange}
            color={color}
          />
        </div>
      ))}
    </div>
  );
}
