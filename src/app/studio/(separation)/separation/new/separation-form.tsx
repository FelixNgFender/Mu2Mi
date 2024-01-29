'use client';

import { Button } from '@/components/ui/button';
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
import { httpStatus } from '@/lib/http';
import { signedUrlBodySchemaClient } from '@/validations/client/asset';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
    SeparationFormSchema,
    SeparationFormSchemaType,
    models,
} from './_schemas/changeme';

const steps = [
    {
        id: 'Step 1',
        name: 'Select file',
        fields: [],
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

    const computeSHA256 = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    };

    const handleFileUpload = async (file: File) => {
        const response = await fetch('/api/asset/presigned-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: file.type,
                size: file.size,
                checksum: await computeSHA256(file),
            }),
        });
        const responseData = await response.json();
        if (
            response.status === httpStatus.clientError.unauthorized.code ||
            response.status ===
                httpStatus.clientError.unprocessableEntity.code ||
            response.status === httpStatus.clientError.badRequest.code ||
            response.status ===
                httpStatus.serverError.internalServerError.code ||
            response.status !== httpStatus.success.ok.code
        ) {
            toast({
                variant: 'destructive',
                title: responseData.message || 'Uh oh! Something went wrong.',
                description: responseData.error || '',
            });
            return;
        }

        const { url, id: fileId } = responseData;
        await uploadFile(url, file);
        return fileId;
    };

    const uploadFile = async (url: string, file: File) => {
        try {
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

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFile(file);
    };

    const onSubmit = async (data: SeparationFormSchemaType) => {
        if (!file) {
            toast({
                variant: 'destructive',
                title: 'No file selected',
                description: 'Please select a file to upload.',
            });
            setCurrentStep(-1);
            return;
        }
        const fileId = await handleFileUpload(file);
        if (!fileId) return;
        form.reset();
    };

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
                            <Tabs defaultValue="local">
                                <TabsList className="mb-4">
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
                                <TabsContent value="local">
                                    <FormField
                                        name="audio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Drop your file here or
                                                    browse
                                                </FormLabel>
                                                <FormDescription>
                                                    Supports:{' '}
                                                    {assetConfig.allowedFileTypes
                                                        .map(
                                                            (type) =>
                                                                type
                                                                    .toUpperCase()
                                                                    .slice(6), // hack to remove 'audio/' prefix
                                                        )
                                                        .join(', ')}
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        className="max-w-lg"
                                                        name="audio"
                                                        type="file"
                                                        required
                                                        accept={assetConfig.allowedFileTypes.join(
                                                            ',',
                                                        )}
                                                        disabled={
                                                            form.formState
                                                                .isSubmitting
                                                        }
                                                        aria-disabled={
                                                            form.formState
                                                                .isSubmitting
                                                        }
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                                {/* TODO: implement */}
                                <TabsContent value="remote">remote</TabsContent>
                                <TabsContent value="youtube">
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
            <div className="flex justify-between pt-48">
                <Button
                    type="button"
                    onClick={prev}
                    disabled={currentStep === 0}
                    variant="outline"
                    size="icon"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                    type="button"
                    onClick={next}
                    disabled={currentStep === steps.length - 1}
                    variant="outline"
                    size="icon"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
        </>
    );
};