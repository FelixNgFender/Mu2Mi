'use client';

import { getPresignedUrl } from '@/app/studio/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { midiTranscriptionAssetConfig } from '@/config/asset';
import { siteConfig } from '@/config/site';
import { umami } from '@/lib/analytics';
import { cn, formatValidationErrors } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { transcribeMidi } from './actions';
import { MidiFormType, midiFormSchema } from './schemas';

const steps = [
    {
        id: 'Step 1',
        name: 'Select files',
        fields: ['files'],
    },
    { id: 'Step 2', name: 'Upload files' },
];

export const MidiForm = () => {
    const { toast } = useToast();

    const [files, setFiles] = useState<FileList | null>(null);
    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const delta = currentStep - previousStep;

    const form = useForm<MidiFormType>({
        resolver: zodResolver(midiFormSchema),
        defaultValues: {
            files: null,
        },
    });

    type FieldName = keyof MidiFormType;

    const next = async () => {
        const fields = steps[currentStep]?.fields;
        if (!fields) return;
        const isValid = await form.trigger(fields as FieldName[], {
            shouldFocus: true,
        });

        if (!isValid) return;

        if (currentStep < steps.length - 1) {
            if (currentStep === steps.length - 2) {
                await form.handleSubmit(onSubmit)();
            }
            setPreviousStep(currentStep);
            setCurrentStep((step) => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setPreviousStep(currentStep);
            setCurrentStep((step) => step - 1);
        }
    };

    const computeSHA256 = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    };

    const uploadFile = async (url: string, file: File) => {
        try {
            // Don't use Server Actions here because we can upload directly to S3
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });
            if (!res.ok) {
                throw new Error(`Failed to upload file: ${file.name}`);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || '',
            });
        }
    };

    const handleFilesUpload = async (files: FileList) => {
        try {
            const promises = Array.from(files).map(async (file) => {
                const { data, validationErrors, serverError } =
                    await getPresignedUrl({
                        type: file.type as (typeof midiTranscriptionAssetConfig.allowedMimeTypes)[number],
                        extension: file.name.split('.').pop() || '',
                        size: file.size,
                        checksum: await computeSHA256(file),
                    });
                if (validationErrors) {
                    throw new Error(formatValidationErrors(validationErrors));
                } else if (serverError || !data) {
                    throw new Error(serverError);
                }
                const { url, assetId } = data;
                await uploadFile(url, file);
                return {
                    assetId,
                    file,
                };
            });
            return await Promise.all(promises);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || '',
            });
        }
    };

    const onSubmit: SubmitHandler<MidiFormType> = async (data) => {
        if (window && window.umami) {
            window.umami.track(umami.midi.init.name);
        }
        toast({
            description: 'Your files are being uploaded.',
        });
        const uploadedAssets = await handleFilesUpload(data.files);

        if (!uploadedAssets || uploadedAssets.some((asset) => !asset)) {
            form.reset();
            setCurrentStep(-1);
            return;
        }

        try {
            const promises = uploadedAssets.map(async (data) => {
                return await transcribeMidi({
                    name: data.file.name,
                    assetId: data.assetId,
                });
            });
            const results = await Promise.all(promises);
            for (const result of results) {
                if (result.validationErrors) {
                    for (const [path, value] of Object.entries(
                        result.validationErrors,
                    )) {
                        form.setError(path as FieldName, {
                            type: path,
                            message: value.join(', '),
                        });
                    }
                    setCurrentStep(-1);
                }
                if (result.serverError) {
                    if (window && window.umami) {
                        window.umami.track(umami.midi.failure.name, {
                            error: result.serverError,
                        });
                    }
                    toast({
                        variant: 'destructive',
                        title: 'Uh oh! Something went wrong.',
                        description: result.serverError,
                    });
                    setCurrentStep(-1);
                    form.reset();
                }
            }
            if (results.every((result) => result.data)) {
                if (window && window.umami) {
                    window.umami.track(umami.midi.success.name);
                }
                toast({
                    title: 'Files uploaded successfully.',
                    description: '🔥 We are cooking your tracks.',
                });
                form.reset();
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || '',
            });
        }
    };

    return (
        <>
            {/* steps */}
            <nav aria-label="Progress">
                <ol
                    role="list"
                    className="space-y-4 md:flex md:space-x-8 md:space-y-0"
                >
                    {steps.map((step, index) => (
                        <li key={step.name} className="md:flex-1">
                            {currentStep > index ? (
                                <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                    <span className="text-sm font-medium text-primary transition-colors">
                                        {step.id}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step.name}
                                    </span>
                                </div>
                            ) : currentStep === index ? (
                                <div
                                    className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                                    aria-current="step"
                                >
                                    <span className="text-sm font-medium text-primary">
                                        {step.id}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step.name}
                                    </span>
                                </div>
                            ) : (
                                <div className="group flex w-full flex-col border-l-4 border-muted-foreground py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                    <span className="text-sm font-medium text-muted-foreground transition-colors">
                                        {step.id}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step.name}
                                    </span>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Form */}
            <Form {...form}>
                <form
                    className="flex flex-1 flex-col"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    {currentStep === 0 && (
                        <motion.div
                            className="flex flex-1 flex-col space-y-8"
                            initial={{
                                x: delta >= 0 ? '50%' : '-50%',
                                opacity: 0,
                            }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                                Submit your tracks
                            </h2>
                            <Tabs
                                defaultValue="local"
                                className="flex flex-1 flex-col"
                            >
                                <TabsList className="mb-4 self-start">
                                    <TabsTrigger value="local">
                                        Local files
                                    </TabsTrigger>
                                    <TabsTrigger value="remote">
                                        Remote files
                                    </TabsTrigger>
                                    <TabsTrigger value="youtube">
                                        YouTube
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="local"
                                    className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                                >
                                    <FormField
                                        name="files"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-1 flex-col items-center space-y-4">
                                                <FormControl>
                                                    <Dropzone
                                                        classNameWrapper="w-full flex-1 max-h-64"
                                                        className="h-full w-full"
                                                        name={field.name}
                                                        required
                                                        ref={field.ref}
                                                        multiple
                                                        disabled={
                                                            form.formState
                                                                .isSubmitting
                                                        }
                                                        aria-disabled={
                                                            form.formState
                                                                .isSubmitting
                                                        }
                                                        accept={midiTranscriptionAssetConfig.allowedMimeTypes.join(
                                                            ', ',
                                                        )}
                                                        dropMessage={
                                                            field.value
                                                                ? Array.from(
                                                                      field.value,
                                                                  )
                                                                      .map(
                                                                          (
                                                                              file,
                                                                          ) =>
                                                                              // @ts-expect-error - TS doesn't know that file is a File
                                                                              file.name,
                                                                      )
                                                                      .join(
                                                                          ', ',
                                                                      )
                                                                : "Drop like it's hot 🔥"
                                                        }
                                                        handleOnDrop={(
                                                            acceptedFiles: FileList | null,
                                                        ) => {
                                                            field.onChange(
                                                                acceptedFiles,
                                                            );
                                                            setFiles(
                                                                acceptedFiles,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Supports:{' '}
                                                    {` ${midiTranscriptionAssetConfig.allowedFileTypes
                                                        .map((type) =>
                                                            type.toUpperCase(),
                                                        )
                                                        .join(', ')}`}
                                                </FormDescription>
                                                <FormMessage />
                                                {files &&
                                                    Array.from(files).map(
                                                        (file, index) => {
                                                            return (
                                                                <audio
                                                                    key={index}
                                                                    controls
                                                                    src={URL.createObjectURL(
                                                                        file,
                                                                    )}
                                                                />
                                                            );
                                                        },
                                                    )}
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                                {/* TODO: implement */}
                                <TabsContent
                                    value="remote"
                                    className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                                >
                                    remote
                                </TabsContent>
                                <TabsContent
                                    value="youtube"
                                    className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
                                >
                                    youtube
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            className="flex flex-1 flex-col space-y-8"
                            initial={{
                                x: delta >= 0 ? '50%' : '-50%',
                                opacity: 0,
                            }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                                Submission complete
                            </h2>
                            <p className="leading-7 text-muted-foreground [&:not(:first-child)]:mt-6">
                                Your track has been submitted for processing.{' '}
                                <a
                                    href={
                                        siteConfig.paths.studio
                                            .newMidiTranscription
                                    }
                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                        }),
                                        'p-0',
                                    )}
                                >
                                    Transcribe a new track
                                </a>{' '}
                                or{' '}
                                <Link
                                    href={
                                        siteConfig.paths.studio
                                            .midiTranscription
                                    }
                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                        }),
                                        'p-0',
                                    )}
                                >
                                    view the status
                                </Link>{' '}
                                of your newly submitted track.
                            </p>
                        </motion.div>
                    )}
                </form>
            </Form>

            {/* Navigation */}
            <div className="flex justify-between space-x-2 pb-4">
                {!form.formState.isSubmitSuccessful && (
                    <>
                        <Button
                            type="button"
                            onClick={prev}
                            disabled={
                                currentStep === 0 || form.formState.isSubmitting
                            }
                            variant="outline"
                            size="icon"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            type="button"
                            onClick={next}
                            disabled={
                                currentStep === steps.length - 1 ||
                                form.formState.isSubmitting
                            }
                            variant="outline"
                            size="icon"
                        >
                            {form.formState.isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ChevronRight className="h-6 w-6" />
                            )}
                        </Button>
                    </>
                )}
                {form.formState.isSubmitSuccessful && (
                    <>
                        <a
                            href={siteConfig.paths.studio.newMidiTranscription}
                            className={buttonVariants({
                                variant: 'outline',
                            })}
                        >
                            Transcribe new tracks
                        </a>
                        <Link
                            href={siteConfig.paths.studio.midiTranscription}
                            className={buttonVariants({
                                variant: 'outline',
                            })}
                        >
                            View tracks
                        </Link>
                    </>
                )}
            </div>
        </>
    );
};
