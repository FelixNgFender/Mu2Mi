'use client';

import { getPresignedUrl } from '@/app/studio/uploads/actions';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { assetConfig } from '@/config/asset';
import { models } from '@/types/replicate';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { separateTrack } from './actions';

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
            'model_name',
            'stem',
            'clip_mode',
            'shifts',
            'overlap',
            'mp3_bitrate',
            'float32',
            'output_format',
        ],
    },
    { id: 'Step 3', name: 'Upload file' },
];

export const SeparationForm = () => {
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const delta = currentStep - previousStep;

    const form = useForm<SeparationFormSchemaType>({
        resolver: zodResolver(SeparationFormSchema),
        defaultValues: {
            file: null,
            model_name: 'htdemucs',
            stem: undefined,
            clip_mode: 'rescale',
            shifts: 1,
            overlap: 0.25,
            mp3_bitrate: 320,
            float32: false,
            output_format: 'mp3',
        },
    });

    type FieldName = keyof SeparationFormSchemaType;

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
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });
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
            type: file.type as (typeof assetConfig.allowedMimeTypes)[number],
            extension: file.name.split('.').pop() || '',
            size: file.size,
            checksum: await computeSHA256(file),
        });
        if (!result) return;
        if (!result.success) {
            try {
                const errors = JSON.parse(result.error);
                for (const error of errors) {
                    for (const path of error.path) {
                        form.setError(path, {
                            type: path,
                            message: error.message,
                        });
                    }
                }
                setCurrentStep(-1);
            } catch (e) {
                toast({
                    variant: 'destructive',
                    title: 'Uh oh! Something went wrong.',
                    description: result.error,
                });
            }
        }
        if (result.success) {
            const { url, assetId } = result.data;
            await uploadFile(url, file);
            return assetId;
        }
    };

    const onSubmit = async (data: SeparationFormSchemaType) => {
        toast({
            description: 'Your file is being uploaded.',
        });
        const assetId = await handleFileUpload(data.file);
        if (!assetId) {
            form.reset();
            setCurrentStep(-1);
            return;
        }

        // asset has been uploaded to db and file storage, now separate track
        const result = await separateTrack({
            name: data.file.name,
            assetId: assetId,

            model_name: data.model_name,
            stem: data.stem,
            clip_mode: data.clip_mode,
            shifts: data.shifts,
            overlap: data.overlap,
            mp3_bitrate: data.mp3_bitrate,
            float32: data.float32,
            output_format: data.output_format,
        });
        console.log(result);
        if (!result) return;
        if (!result.success) {
            try {
                const errors = JSON.parse(result.error);
                for (const error of errors) {
                    for (const path of error.path) {
                        form.setError(path, {
                            type: path,
                            message: error.message,
                        });
                    }
                }
                setCurrentStep(-1);
            } catch (e) {
                toast({
                    variant: 'destructive',
                    title: 'Uh oh! Something went wrong.',
                    description: result.error,
                });
                form.reset();
                setCurrentStep(-1);
                return;
            }
        }
        if (result.success) {
            toast({
                title: 'File uploaded successfully.',
                description: '🔥 We are cooking your track.',
            });
            form.reset();
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
                                                        accept={assetConfig.allowedMimeTypes.join(
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
                                                    {` ${allowedFileTypes.join(
                                                        ', ',
                                                    )}`}
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
                            <FormField
                                control={form.control}
                                name="model_name"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Model</FormLabel>
                                        <FormDescription>
                                            Choose a model to separate your
                                            track with.
                                        </FormDescription>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                {models.map((model) => (
                                                    <FormItem
                                                        key={model.name}
                                                        className="flex items-center space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={
                                                                    model.name
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {model.name}
                                                        </FormLabel>
                                                        <FormDescription className="text-sm">
                                                            {model.description}
                                                        </FormDescription>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stem"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>
                                            Separate into stem
                                        </FormLabel>
                                        <FormDescription>
                                            Only separate audio into the chosen
                                            stem and others (no stem). Optional.
                                        </FormDescription>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a stem" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[
                                                    'vocals',
                                                    'bass',
                                                    'drums',
                                                    'guitar',
                                                    'piano',
                                                    'other',
                                                ].map((stem) => (
                                                    <SelectItem
                                                        key={stem}
                                                        value={stem}
                                                    >
                                                        {stem[0]?.toUpperCase() +
                                                            stem.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clip_mode"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Clip mode</FormLabel>
                                        <FormDescription>
                                            Strategy for avoiding clipping:
                                            rescaling entire signal if necessary
                                            (rescale) or hard clipping (clamp).
                                        </FormDescription>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose clip mode" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['rescale', 'clamp'].map(
                                                    (clipMode) => (
                                                        <SelectItem
                                                            key={clipMode}
                                                            value={clipMode}
                                                        >
                                                            {clipMode[0]?.toUpperCase() +
                                                                clipMode.slice(
                                                                    1,
                                                                )}
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
                                name="shifts"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shifts</FormLabel>
                                        <FormDescription>
                                            Number of random shifts for
                                            equivariant stabilization. Increase
                                            separation time but improves quality
                                            of track separation.
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="overlap"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Overlap</FormLabel>
                                        <FormDescription>
                                            Overlap between the splits.
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="output_format"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Output format</FormLabel>
                                        <FormDescription>
                                            Format of the output file.
                                        </FormDescription>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose output format" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['mp3', 'wav', 'flac'].map(
                                                    (format) => (
                                                        <SelectItem
                                                            key={format}
                                                            value={format}
                                                        >
                                                            {format.toUpperCase()}
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
                                name="mp3_bitrate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MP3 bitrate</FormLabel>
                                        <FormDescription>
                                            Bitrate of the converted MP3 track.
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="float32"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Save as float32
                                            </FormLabel>
                                            <FormDescription>
                                                Save WAV output as float32 (2x
                                                bigger).
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <>
                            <h2 className="text-base font-semibold leading-7 text-gray-900">
                                Complete
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                Thank you for your submission.
                            </p>
                        </>
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
                            href="/studio/new"
                            className={buttonVariants({
                                variant: 'outline',
                            })}
                        >
                            Separate new track
                        </a>
                        <Link
                            href="/studio"
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

const allowedFileTypes = assetConfig.allowedMimeTypes.map(
    (type) => type.toUpperCase().slice(6), // hack to remove 'audio/' prefix
);

const SeparationFormSchema = z.object({
    file: z
        .any()
        .refine(
            (files) => {
                return files?.[0]?.size <= assetConfig.maxFileSize;
            },
            `Max file size is ${assetConfig.maxFileSize / 1024 / 1024} MB.`,
        )
        .refine(
            (files) => assetConfig.allowedMimeTypes.includes(files?.[0]?.type),
            `Only ${allowedFileTypes.join(', ')} files are allowed.`,
        )
        .transform((files) => files?.[0]),
    model_name: z
        .enum([...models.map((model) => model.name)] as [string, ...string[]])
        .default('htdemucs'),
    stem: z
        .enum(['vocals', 'bass', 'drums', 'guitar', 'piano', 'other'])
        .optional(),
    clip_mode: z.enum(['rescale', 'clamp']).default('rescale'),
    shifts: z.number().int().min(1).max(10).default(1),
    overlap: z.number().default(0.25),
    output_format: z.enum(['mp3', 'wav', 'flac']).default('mp3'),
    mp3_bitrate: z.number().int().default(320),
    float32: z.boolean().default(false),
});

type SeparationFormSchemaType = z.infer<typeof SeparationFormSchema>;
