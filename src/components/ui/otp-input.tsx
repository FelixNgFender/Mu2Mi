'use client';

import { cn } from '@/lib/utils';
import { OTPInput as ExternalOTPInput, SlotProps } from 'input-otp';

type OTPInputProps = {
    value?: string;
    onChange?: (newValue: string) => unknown;
    maxLength: number;
    allowNavigation?: boolean;
    inputMode?: 'numeric' | 'text';
    onComplete?: (...args: any[]) => unknown;
    containerClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const OTPInput = ({
    value,
    onChange,
    maxLength,
    allowNavigation,
    inputMode,
    onComplete,
    containerClassName,
    disabled,
    required,
}: OTPInputProps) => {
    return (
        <ExternalOTPInput
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            allowNavigation={allowNavigation}
            inputMode={inputMode}
            onComplete={onComplete}
            containerClassName={containerClassName}
            disabled={disabled}
            required={required}
            // containerClassName="group flex items-center has-[:disabled]:opacity-30"
            render={({ slots }) => (
                <>
                    <div className="flex">
                        {slots.slice(0, 3).map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                        ))}
                    </div>

                    <FakeDash />

                    <div className="flex">
                        {slots.slice(3).map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                        ))}
                    </div>
                </>
            )}
        />
    );
};

function Slot(props: SlotProps) {
    return (
        <div
            className={cn(
                'relative h-14 w-10 text-[2rem]',
                'flex items-center justify-center',
                'transition-all duration-300',
                'border-y border-r border-border first:rounded-l-md first:border-l last:rounded-r-md',
                'group-focus-within:border-accent-foreground/20 group-hover:border-accent-foreground/20',
                'outline outline-0 outline-accent-foreground/20',
                { 'outline-4 outline-accent-foreground': props.isActive },
            )}
        >
            {props.char !== null && <div>{props.char}</div>}
            {props.hasFakeCaret && <FakeCaret />}
        </div>
    );
}

function FakeCaret() {
    return (
        <div className="pointer-events-none absolute inset-0 flex animate-caret-blink items-center justify-center">
            <div className="h-8 w-px bg-white" />
        </div>
    );
}

function FakeDash() {
    return (
        <div className="flex w-10 items-center justify-center">
            <div className="h-1 w-3 rounded-full bg-border" />
        </div>
    );
}
