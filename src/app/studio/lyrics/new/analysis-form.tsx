'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dropzone } from '@/components/ui/dropzone';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { trackAnalysisAssetConfig } from '@/config/asset';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { getPresignedUrl } from '../../actions';
import { analyzeTrack } from './actions';
import allImage from './assets/all.jpg';
import defaultPresetImage from './assets/default.jpg';
import withSonificationImage from './assets/with-sonification.jpg';
import withVisualizationImage from './assets/with-visualization.jpg';
import {
    AnalysisFormType,
    analysisFormSchema,
    trackAnalysisModels,
} from './schemas';

const steps = [
    {
        id: 'Step 1',
        name: 'Select file',
        fields: ['file'],
    },
    {
        id: 'Step 2',
        name: 'Preferences',
        fields: [
            'visualize',
            'sonify',
            'activ',
            'embed',
            'model',
            'include_activations',
            'include_embeddings',
        ],
    },
    { id: 'Step 3', name: 'Upload file' },
];

export const AnalysisForm = () => {
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<
        (typeof analysisPresets)[number]['id'] | null
    >(null);
    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const delta = currentStep - previousStep;

    const form = useForm<AnalysisFormType>({
        resolver: zodResolver(analysisFormSchema),
        defaultValues: {
            file: null,
            visualize: false,
            sonify: false,
            activ: false,
            embed: false,
            model: 'harmonix-all',
            include_activations: false,
            include_embeddings: false,
        },
    });

    type FieldName = keyof AnalysisFormType;

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
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || '',
            });
        }
    };

    const handleFileUpload = async (file: File) => {
        const result = await getPresignedUrl({
            type: file.type as (typeof trackAnalysisAssetConfig.allowedMimeTypes)[number],
            extension: file.name.split('.').pop() || '',
            size: file.size,
            checksum: await computeSHA256(file),
        });
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
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.serverError,
            });
            setCurrentStep(-1);
            form.reset();
        }
        if (result && result.data) {
            const { url, assetId } = result.data;
            await uploadFile(url, file);
            return assetId;
        }
    };

    const onSubmit: SubmitHandler<AnalysisFormType> = async (data) => {
        toast({
            description: 'Your file is being uploaded.',
        });
        const assetId = await handleFileUpload(data.file);
        if (!assetId) {
            form.reset();
            setCurrentStep(-1);
            return;
        }

        const result = await analyzeTrack({
            name: data.file.name,
            assetId: assetId,

            visualize: data.visualize,
            sonify: data.sonify,
            activ: data.activ,
            embed: data.embed,
            model: data.model,
            include_activations: data.include_activations,
            include_embeddings: data.include_embeddings,
        });

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
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.serverError,
            });
            form.reset();
            setCurrentStep(-1);
        }
        if (result.data && result.data.success) {
            toast({
                title: 'File uploaded successfully.',
                description: '🔥 We are cooking your track.',
            });
            form.reset();
        }
    };

    const resetAllButFile = () => {
        form.reset({
            file: form.getValues('file'),
        });
    };

    const analysisPresets = [
        {
            id: 'default',
            icon: defaultPresetImage,
            name: 'Default',
            description:
                "Analyzes the track's musical structure (tempo, beats, downbeats, section boundaries, and segment labels).",
            labels: ['analysis'],
            onClick: () => {
                resetAllButFile();
                setSelectedPreset('default');
            },
        },
        {
            id: 'with-visualization',
            icon: withVisualizationImage,
            name: 'With visualization',
            description:
                "Same as default. Also includes a visualization of the track's musical structure.",
            labels: ['analysis', 'visualization'],
            onClick: () => {
                resetAllButFile();
                form.setValue('visualize', true, {
                    shouldValidate: true,
                });
                setSelectedPreset('with-visualization');
            },
        },
        {
            id: 'with-sonification',
            icon: withSonificationImage,
            name: 'With sonification',
            description:
                'Same as default. Also includes a mix of a click track with section callouts and the original audio.',
            labels: ['analysis', 'sonification'],
            onClick: () => {
                resetAllButFile();
                form.setValue('sonify', true, {
                    shouldValidate: true,
                });
                setSelectedPreset('with-sonification');
            },
        },
        {
            id: 'all',
            icon: allImage,
            name: 'All',
            description: 'Includes all available data.',
            labels: ['analysis', 'sonification', 'visualization'],
            onClick: () => {
                resetAllButFile();
                form.setValue('sonify', true, {
                    shouldValidate: true,
                });
                form.setValue('visualize', true, {
                    shouldValidate: true,
                });
                setSelectedPreset('all');
            },
        },
    ] as const;

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
                                Submit your track
                            </h2>
                            <Tabs
                                defaultValue="local"
                                className="flex flex-1 flex-col"
                            >
                                <TabsList className="mb-4 self-start">
                                    <TabsTrigger value="local">
                                        Local file
                                    </TabsTrigger>
                                    <TabsTrigger value="remote">
                                        Remote file
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
                                        name="file"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-1 flex-col items-center space-y-4">
                                                <FormControl>
                                                    <Dropzone
                                                        classNameWrapper="w-full flex-1 max-h-64"
                                                        className="h-full w-full"
                                                        name={field.name}
                                                        required
                                                        ref={field.ref}
                                                        disabled={
                                                            form.formState
                                                                .isSubmitting
                                                        }
                                                        aria-disabled={
                                                            form.formState
                                                                .isSubmitting
                                                        }
                                                        accept={trackAnalysisAssetConfig.allowedMimeTypes.join(
                                                            ', ',
                                                        )}
                                                        dropMessage={
                                                            field.value
                                                                ? field.value[0]
                                                                      ?.name
                                                                : "Drop like it's hot 🔥"
                                                        }
                                                        handleOnDrop={(
                                                            acceptedFiles: FileList | null,
                                                        ) => {
                                                            field.onChange(
                                                                acceptedFiles,
                                                            );
                                                            setFile(
                                                                acceptedFiles?.[0] ||
                                                                    null,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Supports:{' '}
                                                    {` ${trackAnalysisAssetConfig.allowedFileTypes
                                                        .map((type) =>
                                                            type.toUpperCase(),
                                                        )
                                                        .join(', ')}`}
                                                </FormDescription>
                                                <FormMessage />
                                                {file && (
                                                    <audio
                                                        controls
                                                        src={URL.createObjectURL(
                                                            file,
                                                        )}
                                                    />
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
                                Choose a preset
                            </h2>
                            <div className="flex flex-col space-y-4 p-4 pt-0">
                                {analysisPresets.map((item) => (
                                    <BackgroundGradient
                                        key={item.id}
                                        className="rounded-3xl bg-background"
                                    >
                                        <button
                                            type="button"
                                            className={cn(
                                                'flex w-full items-center space-x-4 rounded-3xl p-4 transition-all hover:bg-accent',
                                                selectedPreset === item.id &&
                                                    'bg-muted',
                                            )}
                                            onClick={item.onClick}
                                        >
                                            <Image
                                                src={item.icon}
                                                alt={item.name}
                                                className="h-24 w-24 rounded-xl"
                                            />
                                            <div className="flex flex-1 flex-col items-start space-y-2 text-left text-base">
                                                <div className="flex w-full flex-col space-y-1">
                                                    <div className="flex items-center">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="font-semibold">
                                                                {item.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="line-clamp-2 text-sm text-muted-foreground">
                                                    {item.description.substring(
                                                        0,
                                                        300,
                                                    )}
                                                </div>
                                                {item.labels.length ? (
                                                    <div className="flex items-center space-x-2">
                                                        {item.labels.map(
                                                            (label) => (
                                                                <Badge
                                                                    key={label}
                                                                    variant="secondary"
                                                                >
                                                                    {label}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </button>
                                    </BackgroundGradient>
                                ))}
                            </div>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        Custom options
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-1 flex-col space-y-8 p-4">
                                        <FormField
                                            control={form.control}
                                            name="model"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>
                                                        Model name
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Choose a model to
                                                        analyze your track with.
                                                    </FormDescription>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Choose output format" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {trackAnalysisModels.map(
                                                                (model) => (
                                                                    <SelectItem
                                                                        key={
                                                                            model
                                                                        }
                                                                        value={
                                                                            model
                                                                        }
                                                                    >
                                                                        {model}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="visualize"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Visualize track
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Save track
                                                            analysis&apos;s
                                                            visualization.
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="sonify"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Sonify track
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Save track
                                                            analysis&apos;s
                                                            sonification. This
                                                            will include a mix
                                                            of a click track
                                                            with section
                                                            callouts and the
                                                            original audio.
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="activ"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Save activations
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Save frame-level raw
                                                            activations from
                                                            sigmoid and softmax
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="include_activations"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Include activations
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Whether to include
                                                            activations in the
                                                            analysis results or
                                                            not.
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="include_embeddings"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Include embeddings
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Whether to include
                                                            embeddings in the
                                                            analysis results or
                                                            not.
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
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
                                    href="/studio/analysis/new"
                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                        }),
                                        'p-0',
                                    )}
                                >
                                    Analyze a new track
                                </a>{' '}
                                or{' '}
                                <Link
                                    href="/studio/analysis"
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
                            href="/studio/analysis/new"
                            className={buttonVariants({
                                variant: 'outline',
                            })}
                        >
                            Analyze new track
                        </a>
                        <Link
                            href="/studio/analysis"
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
