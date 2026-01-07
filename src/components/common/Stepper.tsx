import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

type Step = {
  id: string;
  label: string;
  description?: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  className?: string;
};

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const el = stepRefs.current[currentStep];
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [currentStep]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const walk = startX.current - e.pageX;
    scrollRef.current.scrollLeft = scrollLeft.current + walk;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <div
      data-dui-stepper-container
      data-dui-initial-step={currentStep}
      className={className}
    > 
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="h-28 w-full overflow-x-auto no-scrollbar flex items-start justify-center pt-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex min-w-max items-center px-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.id}
                ref={el => {
                  stepRefs.current[index] = el;
                }}
                data-dui-step
                data-active={isActive}
                data-completed={isCompleted}
                aria-disabled={!isActive && !isCompleted}
                className="group flex items-center shrink-0"
              >
                {/* Step */}
                <div className="relative flex flex-col items-center w-24 pt-2">
                  <span
                    className={clsx(
                      'grid h-8 w-8 place-items-center rounded-full text-sm transition-all duration-300',
                      {
                        'bg-primaryHover text-white font-semibold scale-110':
                          isActive,
                        'bg-green-primary text-white': isCompleted,
                        'bg-stone-200 text-grey-300': !isActive && !isCompleted,
                      }
                    )}
                  >
                    {isCompleted ? <Check size={18} /> : index + 1}
                  </span>

                  <span
                    className={clsx(
                      'absolute top-10 w-24 text-center text-sm transition-colors line-clamp-2',
                      {
                        'font-semibold ': isActive || isCompleted,
                        'font-semibold text-grey-300':
                          !isCompleted && !isActive,
                      }
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Línea animada */}
                {!isLast && (
                  <div className="mx-1 flex-1 min-w-[40px]">
                    <div className="relative h-1 bg-stone-200 overflow-hidden rounded">
                      <div
                        className={clsx(
                          'absolute inset-0 origin-left bg-green-primary transition-transform duration-500 ease-out',
                          isCompleted ? 'scale-x-100' : 'scale-x-0'
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Descripción */}
      <div className="mt-2">
        {steps.map(({ description }, index) => (
          <div
            key={index}
            data-dui-step-content={index}
            className={clsx({
              hidden: index !== currentStep,
              block: index === currentStep,
            })}
          >
            {description && (
              <p className="font-bold text-md text-primaryDark">
                {description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
