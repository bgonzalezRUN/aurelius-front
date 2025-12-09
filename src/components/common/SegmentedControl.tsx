import clsx from "clsx";

export type SegmentedOption<T extends string | number> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string | number> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
  className={clsx(
    "inline-flex bg-white rounded-[10px] max-w-fit border border-primary-primary overflow-hidden"
  )}
>
  {options.map((opt, index) => {
    const selected = opt.value === value;
    const isFirst = index === 0;
    const isLast = index === options.length - 1;

    const roundClasses = clsx({
      "rounded-l-[10px]": isFirst,
      "rounded-r-[10px]": isLast,
      "rounded-none": !isFirst && !isLast,
    });

    return (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={clsx(
          "px-4 py-1 text-xl font-semibold transition",
          roundClasses,
          {
            "bg-primary-primary text-white rounded-none": selected,
            "text-primary-primary hover:bg-primaryHover hover:text-white": !selected,
          }
        )}
      >
        {opt.label}
      </button>
    );
  })}
</div>
  );
}
