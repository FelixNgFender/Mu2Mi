import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

// TODO: Implement
const SeparationPage = async () => {
    return (
        <section className="relative h-full">
            <div className="container mt-4 flex h-14 max-w-screen-xl items-center">
                <h1 className="text-lg font-extrabold tracking-tight lg:text-xl">
                    Track Separation
                </h1>
                <div className="flex flex-1 justify-end space-x-2">
                    {/* <Button
                        variant="outline"
                        className={cn(
                            'relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64',
                        )}
                        // onClick={() => setOpen(true)}
                        // {...props}
                    >
                        <span className="hidden lg:inline-flex">
                            Search site...
                        </span>
                        <span className="inline-flex lg:hidden">Search...</span>
                        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button> */}

                    {/* <Input
                        type="search"
                        className="h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64"
                        placeholder="Search tracks..."
                    /> */}
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Track
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default SeparationPage;
