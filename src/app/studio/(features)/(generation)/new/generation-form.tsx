'use client';

import { getPresignedUrl } from '@/app/studio/actions';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PresetCard } from '@/components/ui/preset-card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { musicGenerationAssetConfig } from '@/config/asset';
import { siteConfig } from '@/config/site';
import { umami } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { Preset } from '@/types/studio';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { generateMusic } from './actions';
import melodyLargeImage from './assets/melody-large.jpg';
import stereoMelodyImage from './assets/stereo-melody-large.jpg';
import {
    MusicGenerationFormType,
    musicGenerationFormSchema,
    musicGenerationModels,
} from './schemas';

const steps = [
    {
        id: 'Step 1',
        name: 'Preferences',
        fields: [
            'file',
            'model_version',
            'prompt',
            'duration',
            'continuation',
            'continuation_start',
            'continuation_end',
            'multi_band_diffusion',
            'normalization_strategy',
            'top_k',
            'top_p',
            'temperature',
            'classifier_free_guidance',
            'output_format',
            'seed',
        ],
    },
    { id: 'Step 2', name: 'Generate track' },
];

export const GenerationForm = () => {
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<
        (typeof generationPresets)[number]['id'] | null
    >(null);
    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const delta = currentStep - previousStep;

    const form = useForm<MusicGenerationFormType>({
        resolver: zodResolver(musicGenerationFormSchema),
        defaultValues: {
            file: null,
            model_version: 'melody-large',
            prompt: '',
            duration: 8,
            continuation: false,
            continuation_start: 0,
            continuation_end: 0,
            multi_band_diffusion: false,
            normalization_strategy: 'loudness',
            top_k: 250,
            top_p: 0,
            temperature: 1,
            classifier_free_guidance: 3,
            output_format: 'mp3',
            seed: undefined,
        },
    });

    type FieldName = keyof MusicGenerationFormType;

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
            type: file.type as (typeof musicGenerationAssetConfig.allowedMimeTypes)[number],
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

    const onSubmit: SubmitHandler<MusicGenerationFormType> = async (data) => {
        if (window && window.umami) {
            window.umami.track(umami.generation.init.name);
        }

        toast({
            description: 'Your file is being uploaded.',
        });

        let assetId: string | undefined;

        if (data.file) {
            assetId = await handleFileUpload(data.file);
            if (!assetId) {
                form.reset();
                setCurrentStep(-1);
                return;
            }
        }

        const result = await generateMusic({
            name: data.prompt,
            assetId: assetId,

            model_version: data.model_version,
            prompt: data.prompt,
            duration: data.duration,
            continuation: data.continuation,
            continuation_start: data.continuation_start ?? undefined,
            continuation_end: data.continuation_end,
            multi_band_diffusion: data.multi_band_diffusion,
            normalization_strategy: data.normalization_strategy,
            top_k: data.top_k,
            top_p: data.top_p,
            temperature: data.temperature,
            classifier_free_guidance: data.classifier_free_guidance,
            output_format: data.output_format,
            seed: data.seed,
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
            if (window && window.umami) {
                window.umami.track(umami.generation.failure.name, {
                    error: result.serverError,
                });
            }
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.serverError,
            });
            form.reset();
            setCurrentStep(-1);
        }
        if (result.data && result.data.success) {
            if (window && window.umami) {
                window.umami.track(umami.generation.success.name);
            }
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

    const generationPresets: Preset[] = [
        {
            id: 'melody-large',
            icon: melodyLargeImage,
            name: 'Default',
            description:
                "Text-to-music or melody-to-music. Uses the 'melody-large' model.",
            labels: ['text-to-music', 'melody-to-music'],
            onClick: () => {
                resetAllButFile();
                setSelectedPreset('melody-large');
            },
        },
        {
            id: 'stereo-melody-large',
            icon: stereoMelodyImage,
            name: 'Stereo',
            description:
                'Same as default, but fine-tuned for stereo generation.',
            labels: ['text-to-music', 'melody-to-music', 'stereo'],
            onClick: () => {
                resetAllButFile();
                form.setValue('model_version', 'stereo-melody-large', {
                    shouldValidate: true,
                });
                setSelectedPreset('stereo-melody-large');
            },
        },
    ];

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
                                Choose a preset
                            </h2>
                            <div className="flex flex-col space-y-4 p-4 pt-0">
                                {generationPresets.map((item) => (
                                    <PresetCard
                                        key={item.id}
                                        item={item}
                                        selectedItemId={selectedPreset}
                                    />
                                ))}
                            </div>
                            <FormField
                                control={form.control}
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Prompt</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="110bpm 64kbps 16khz lofi hiphop summer smooth"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A description of the music you want
                                            to generate.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        Custom options
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-1 flex-col space-y-8 p-4">
                                        <FormField
                                            control={form.control}
                                            name="model_version"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>
                                                        Model version
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Choose a model version
                                                        to generate your track.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            {musicGenerationModels.map(
                                                                (model) => (
                                                                    <FormItem
                                                                        key={
                                                                            model.name
                                                                        }
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
                                                                            {
                                                                                model.name
                                                                            }
                                                                        </FormLabel>
                                                                        <FormDescription className="no-scrollbar overflow-x-auto whitespace-nowrap text-sm">
                                                                            {
                                                                                model.description
                                                                            }
                                                                        </FormDescription>
                                                                    </FormItem>
                                                                ),
                                                            )}
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="file"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>
                                                        Input audio
                                                    </FormLabel>
                                                    <FormDescription>
                                                        An audio file that will
                                                        influence the generated
                                                        music. If
                                                        &apos;Continuation&apos;
                                                        is checked, the
                                                        generated music will be
                                                        a continuation of the
                                                        audio file. Otherwise,
                                                        the generated music will
                                                        mimic the audio
                                                        file&apos;s melody.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            name={field.name}
                                                            ref={field.ref}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                            aria-disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                            accept={musicGenerationAssetConfig.allowedMimeTypes.join(
                                                                ', ',
                                                            )}
                                                            placeholder="Choose a file"
                                                            onChange={(e) => {
                                                                const file =
                                                                    e.target
                                                                        .files?.[0];
                                                                if (file) {
                                                                    field.onChange(
                                                                        file,
                                                                    );
                                                                    setFile(
                                                                        file,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
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
                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Duration:{' '}
                                                            {field.value}{' '}
                                                            seconds
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Duration of the
                                                            generated audio.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Slider
                                                            {...field}
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                field.onChange(
                                                                    v[0],
                                                                )
                                                            }
                                                            value={[
                                                                field.value,
                                                            ]}
                                                            min={1}
                                                            max={60}
                                                            step={1}
                                                            className="max-w-64"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="continuation"
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
                                                            Continuation
                                                        </FormLabel>
                                                        <FormDescription>
                                                            If checked,
                                                            generated music will
                                                            continue from input
                                                            audio. Otherwise,
                                                            generated music will
                                                            mimic input
                                                            audio&apos;s melody.
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="continuation_start"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Continuation start
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Start time of the audio
                                                        file to use for
                                                        continuation.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="continuation_end"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Continuation end
                                                    </FormLabel>
                                                    <FormDescription>
                                                        End time of the audio
                                                        file to use for
                                                        continuation. If -1 or
                                                        empty, will default to
                                                        the end of the audio
                                                        clip.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="multi_band_diffusion"
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
                                                            Multi-band diffusion
                                                        </FormLabel>
                                                        <FormDescription>
                                                            If checked, the
                                                            EnCodec tokens will
                                                            be decoded with
                                                            MultiBand Diffusion.
                                                            Only works with
                                                            non-stereo models.
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="normalization_strategy"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>
                                                        Clip mode
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Strategy for normalizing
                                                        audio.
                                                    </FormDescription>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Choose normalization strategy" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {[
                                                                'loudness',
                                                                'clip',
                                                                'peak',
                                                                'rms',
                                                            ].map(
                                                                (normStrat) => (
                                                                    <SelectItem
                                                                        key={
                                                                            normStrat
                                                                        }
                                                                        value={
                                                                            normStrat
                                                                        }
                                                                    >
                                                                        {normStrat[0]?.toUpperCase() +
                                                                            normStrat.slice(
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
                                            name="top_k"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Top k</FormLabel>
                                                    <FormDescription>
                                                        Reduces sampling to the
                                                        k most likely tokens.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="top_p"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Top p</FormLabel>
                                                    <FormDescription>
                                                        Reduces sampling to
                                                        tokens with cumulative
                                                        probability of p. When
                                                        set to `0` (default),
                                                        top_k sampling is used.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="temperature"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Continuation start
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Controls the
                                                        &apos;conservativeness&apos;
                                                        of the sampling process.
                                                        Higher temperature means
                                                        more diversity.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="classifier_free_guidance"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Classifier-free guidance
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Increases the influence
                                                        of inputs on the output.
                                                        Higher values produce
                                                        lower-varience outputs
                                                        that adhere more closely
                                                        to inputs.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="seed"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Seed</FormLabel>
                                                    <FormDescription>
                                                        Seed for random number
                                                        generator. If empty or
                                                        -1, a random seed will
                                                        be used.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={
                                                                form.formState
                                                                    .isSubmitting
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
                                                    <FormLabel>
                                                        Output format
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Output format for
                                                        generated audio.
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
                                                            {['mp3', 'wav'].map(
                                                                (format) => (
                                                                    <SelectItem
                                                                        key={
                                                                            format
                                                                        }
                                                                        value={
                                                                            format
                                                                        }
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
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
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
                                Your track is generating.{' '}
                                <a
                                    href={
                                        siteConfig.paths.studio
                                            .newMusicGeneration
                                    }
                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                        }),
                                        'p-0',
                                    )}
                                >
                                    Generate a new track
                                </a>{' '}
                                or{' '}
                                <Link
                                    href={
                                        siteConfig.paths.studio.musicGeneration
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
                            href={siteConfig.paths.studio.newMusicGeneration}
                            className={buttonVariants({
                                variant: 'outline',
                            })}
                        >
                            Generate new track
                        </a>
                        <Link
                            href={siteConfig.paths.studio.musicGeneration}
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
