// 'use client';
//
// import { getPresignedUrl } from '@/app/studio/actions';
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from '@/components/ui/accordion';
// import { Button, buttonVariants } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Dropzone } from '@/components/ui/dropzone';
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { PresetCard } from '@/components/ui/preset-card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
// import { Slider } from '@/components/ui/slider';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast';
// import { styleRemixAssetConfig } from '@/config/asset';
// import { siteConfig } from '@/config/site';
// import { umami } from '@/lib/analytics';
// import { cn } from '@/lib/utils';
// import { Preset } from '@/types/studio';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { motion } from 'framer-motion';
// import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { useState } from 'react';
// import { SubmitHandler, useForm } from 'react-hook-form';
//
// import { remixTrack } from './actions';
// import chordLargeImage from './assets/chord-large.jpg';
// import chordImage from './assets/chord.jpg';
// import {
//     StyleRemixFormType,
//     styleRemixFormSchema,
//     styleRemixModels,
// } from './schemas';
//
// const steps = [
//     {
//         id: 'Step 1',
//         name: 'Select file',
//         fields: ['file'],
//     },
//     {
//         id: 'Step 2',
//         name: 'Preferences',
//         fields: [
//             'model_version',
//             'prompt',
//             'multi_band_diffusion',
//             'normalization_strategy',
//             'beat_sync_threshold',
//             'large_chord_voca',
//             'chroma_coefficient',
//             'top_k',
//             'top_p',
//             'temperature',
//             'classifier_free_guidance',
//             'output_format',
//             'return_instrumental',
//             'seed',
//         ],
//     },
//     { id: 'Step 3', name: 'Upload file' },
// ];
//
// export const RemixForm = () => {
//     const { toast } = useToast();
//
//     const [file, setFile] = useState<File | null>(null);
//     const [selectedPreset, setSelectedPreset] = useState<
//         (typeof remixPresets)[number]['id'] | null
//     >(null);
//     const [previousStep, setPreviousStep] = useState(0);
//     const [currentStep, setCurrentStep] = useState(0);
//     const delta = currentStep - previousStep;
//
//     const form = useForm<StyleRemixFormType>({
//         resolver: zodResolver(styleRemixFormSchema),
//         defaultValues: {
//             file: null,
//             model_version: 'chord',
//             prompt: '',
//             multi_band_diffusion: false,
//             normalization_strategy: 'loudness',
//             beat_sync_threshold: 0.75,
//             large_chord_voca: true,
//             chroma_coefficient: 1,
//             top_k: 250,
//             top_p: 0,
//             temperature: 1,
//             classifier_free_guidance: 3,
//             output_format: 'mp3',
//             return_instrumental: true,
//             seed: undefined,
//         },
//     });
//
//     type FieldName = keyof StyleRemixFormType;
//
//     const next = async () => {
//         const fields = steps[currentStep]?.fields;
//         if (!fields) return;
//         const isValid = await form.trigger(fields as FieldName[], {
//             shouldFocus: true,
//         });
//
//         if (!isValid) return;
//
//         if (currentStep < steps.length - 1) {
//             if (currentStep === steps.length - 2) {
//                 await form.handleSubmit(onSubmit)();
//             }
//             setPreviousStep(currentStep);
//             setCurrentStep((step) => step + 1);
//         }
//     };
//
//     const prev = () => {
//         if (currentStep > 0) {
//             setPreviousStep(currentStep);
//             setCurrentStep((step) => step - 1);
//         }
//     };
//
//     const computeSHA256 = async (file: File) => {
//         const buffer = await file.arrayBuffer();
//         const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
//         const hashArray = Array.from(new Uint8Array(hashBuffer));
//         const hashHex = hashArray
//             .map((b) => b.toString(16).padStart(2, '0'))
//             .join('');
//         return hashHex;
//     };
//
//     const uploadFile = async (url: string, file: File) => {
//         try {
//             // Don't use Server Actions here because we can upload directly to S3
//             const res = await fetch(url, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': file.type,
//                 },
//                 body: file,
//             });
//             if (!res.ok) {
//                 throw new Error('Failed to upload file');
//             }
//         } catch (error) {
//             toast({
//                 variant: 'destructive',
//                 title: 'Uh oh! Something went wrong.',
//                 description: (error as Error).message || '',
//             });
//         }
//     };
//
//     const handleFileUpload = async (file: File) => {
//         const result = await getPresignedUrl({
//             type: file.type as (typeof styleRemixAssetConfig.allowedMimeTypes)[number],
//             extension: file.name.split('.').pop() || '',
//             size: file.size,
//             checksum: await computeSHA256(file),
//         });
//         if (result.validationErrors) {
//             for (const [path, value] of Object.entries(
//                 result.validationErrors,
//             )) {
//                 form.setError(path as FieldName, {
//                     type: path,
//                     message: value.join(', '),
//                 });
//             }
//             setCurrentStep(-1);
//         }
//         if (result.serverError) {
//             toast({
//                 variant: 'destructive',
//                 title: 'Uh oh! Something went wrong.',
//                 description: result.serverError,
//             });
//             setCurrentStep(-1);
//             form.reset();
//         }
//         if (result && result.data) {
//             const { url, assetId } = result.data;
//             await uploadFile(url, file);
//             return assetId;
//         }
//     };
//
//     const onSubmit: SubmitHandler<StyleRemixFormType> = async (data) => {
//         if (window && window.umami) {
//             window.umami.track(umami.remix.init.name);
//         }
//         toast({
//             description: 'Your file is being uploaded.',
//         });
//         const assetId = await handleFileUpload(data.file);
//         if (!assetId) {
//             form.reset();
//             setCurrentStep(-1);
//             return;
//         }
//
//         const result = await remixTrack({
//             name: data.file.name,
//             assetId: assetId,
//
//             model_version: data.model_version,
//             prompt: data.prompt,
//             multi_band_diffusion: data.multi_band_diffusion,
//             normalization_strategy: data.normalization_strategy,
//             beat_sync_threshold: data.beat_sync_threshold,
//             large_chord_voca: data.large_chord_voca,
//             chroma_coefficient: data.chroma_coefficient,
//             top_k: data.top_k,
//             top_p: data.top_p,
//             temperature: data.temperature,
//             classifier_free_guidance: data.classifier_free_guidance,
//             output_format: data.output_format,
//             return_instrumental: data.return_instrumental,
//             seed: data.seed,
//         });
//
//         if (result.validationErrors) {
//             for (const [path, value] of Object.entries(
//                 result.validationErrors,
//             )) {
//                 form.setError(path as FieldName, {
//                     type: path,
//                     message: value.join(', '),
//                 });
//             }
//             setCurrentStep(-1);
//         }
//         if (result.serverError) {
//             if (window && window.umami) {
//                 window.umami.track(umami.remix.failure.name, {
//                     error: result.serverError,
//                 });
//             }
//             toast({
//                 variant: 'destructive',
//                 title: 'Uh oh! Something went wrong.',
//                 description: result.serverError,
//             });
//             form.reset();
//             setCurrentStep(-1);
//         }
//         if (result.data && result.data.success) {
//             if (window && window.umami) {
//                 window.umami.track(umami.remix.success.name);
//             }
//             toast({
//                 title: 'File uploaded successfully.',
//                 description: '🔥 We are cooking your track.',
//             });
//             form.reset();
//         }
//     };
//
//     const resetAllButFile = () => {
//         form.reset({
//             file: form.getValues('file'),
//         });
//     };
//
//     const remixPresets: Preset[] = [
//         {
//             id: 'chord',
//             icon: chordImage,
//             name: 'Default',
//             description:
//                 "Remixes your track to another style. Uses the 'chord' model.",
//             labels: ['remix', 'chord'],
//             onClick: () => {
//                 resetAllButFile();
//                 setSelectedPreset('chord');
//             },
//         },
//         {
//             id: 'chord-large',
//             icon: chordLargeImage,
//             name: 'High quality',
//             description: 'Takes longer than default, but higher quality.',
//             labels: ['remix', 'chord-large'],
//             onClick: () => {
//                 resetAllButFile();
//                 form.setValue('model_version', 'chord-large', {
//                     shouldValidate: true,
//                 });
//                 setSelectedPreset('chord-large');
//             },
//         },
//     ];
//
//     return (
//         <>
//             {/* steps */}
//             <nav aria-label="Progress">
//                 <ol
//                     role="list"
//                     className="space-y-4 md:flex md:space-x-8 md:space-y-0"
//                 >
//                     {steps.map((step, index) => (
//                         <li key={step.name} className="md:flex-1">
//                             {currentStep > index ? (
//                                 <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
//                                     <span className="text-sm font-medium text-primary transition-colors">
//                                         {step.id}
//                                     </span>
//                                     <span className="text-sm font-medium">
//                                         {step.name}
//                                     </span>
//                                 </div>
//                             ) : currentStep === index ? (
//                                 <div
//                                     className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
//                                     aria-current="step"
//                                 >
//                                     <span className="text-sm font-medium text-primary">
//                                         {step.id}
//                                     </span>
//                                     <span className="text-sm font-medium">
//                                         {step.name}
//                                     </span>
//                                 </div>
//                             ) : (
//                                 <div className="group flex w-full flex-col border-l-4 border-muted-foreground py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
//                                     <span className="text-sm font-medium text-muted-foreground transition-colors">
//                                         {step.id}
//                                     </span>
//                                     <span className="text-sm font-medium">
//                                         {step.name}
//                                     </span>
//                                 </div>
//                             )}
//                         </li>
//                     ))}
//                 </ol>
//             </nav>
//
//             {/* Form */}
//             <Form {...form}>
//                 <form
//                     className="flex flex-1 flex-col"
//                     onSubmit={form.handleSubmit(onSubmit)}
//                 >
//                     {currentStep === 0 && (
//                         <motion.div
//                             className="flex flex-1 flex-col space-y-8"
//                             initial={{
//                                 x: delta >= 0 ? '50%' : '-50%',
//                                 opacity: 0,
//                             }}
//                             animate={{ x: 0, opacity: 1 }}
//                             transition={{ duration: 0.3, ease: 'easeInOut' }}
//                         >
//                             <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
//                                 Submit your track
//                             </h2>
//                             <Tabs
//                                 defaultValue="local"
//                                 className="flex flex-1 flex-col"
//                             >
//                                 <TabsList className="mb-4 self-start">
//                                     <TabsTrigger value="local">
//                                         Local file
//                                     </TabsTrigger>
//                                     <TabsTrigger value="remote">
//                                         Remote file
//                                     </TabsTrigger>
//                                     <TabsTrigger value="youtube">
//                                         YouTube
//                                     </TabsTrigger>
//                                 </TabsList>
//                                 <TabsContent
//                                     value="local"
//                                     className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
//                                 >
//                                     <FormField
//                                         name="file"
//                                         render={({ field }) => (
//                                             <FormItem className="flex flex-1 flex-col items-center space-y-4">
//                                                 <FormControl>
//                                                     <Dropzone
//                                                         classNameWrapper="w-full flex-1 max-h-64"
//                                                         className="h-full w-full"
//                                                         name={field.name}
//                                                         required
//                                                         ref={field.ref}
//                                                         disabled={
//                                                             form.formState
//                                                                 .isSubmitting
//                                                         }
//                                                         aria-disabled={
//                                                             form.formState
//                                                                 .isSubmitting
//                                                         }
//                                                         accept={styleRemixAssetConfig.allowedMimeTypes.join(
//                                                             ', ',
//                                                         )}
//                                                         dropMessage={
//                                                             field.value
//                                                                 ? field.value[0]
//                                                                       ?.name
//                                                                 : "Drop like it's hot 🔥"
//                                                         }
//                                                         handleOnDrop={(
//                                                             acceptedFiles: FileList | null,
//                                                         ) => {
//                                                             field.onChange(
//                                                                 acceptedFiles,
//                                                             );
//                                                             setFile(
//                                                                 acceptedFiles?.[0] ||
//                                                                     null,
//                                                             );
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormDescription>
//                                                     Supports:{' '}
//                                                     {` ${styleRemixAssetConfig.allowedFileTypes
//                                                         .map((type) =>
//                                                             type.toUpperCase(),
//                                                         )
//                                                         .join(', ')}`}
//                                                 </FormDescription>
//                                                 <FormMessage />
//                                                 {file && (
//                                                     <audio
//                                                         controls
//                                                         src={URL.createObjectURL(
//                                                             file,
//                                                         )}
//                                                     />
//                                                 )}
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </TabsContent>
//                                 {/* TODO: implement */}
//                                 <TabsContent
//                                     value="remote"
//                                     className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
//                                 >
//                                     remote
//                                 </TabsContent>
//                                 <TabsContent
//                                     value="youtube"
//                                     className="data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col"
//                                 >
//                                     youtube
//                                 </TabsContent>
//                             </Tabs>
//                         </motion.div>
//                     )}
//
//                     {currentStep === 1 && (
//                         <motion.div
//                             className="flex flex-1 flex-col space-y-8"
//                             initial={{
//                                 x: delta >= 0 ? '50%' : '-50%',
//                                 opacity: 0,
//                             }}
//                             animate={{ x: 0, opacity: 1 }}
//                             transition={{ duration: 0.3, ease: 'easeInOut' }}
//                         >
//                             <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
//                                 Choose a preset
//                             </h2>
//                             <div className="flex flex-col space-y-4 p-4 pt-0">
//                                 {remixPresets.map((item) => (
//                                     <PresetCard
//                                         key={item.id}
//                                         item={item}
//                                         selectedItemId={selectedPreset}
//                                     />
//                                 ))}
//                             </div>
//                             <FormField
//                                 control={form.control}
//                                 name="prompt"
//                                 render={({ field }) => (
//                                     <FormItem className="space-y-3">
//                                         <FormLabel>Prompt</FormLabel>
//                                         <FormControl>
//                                             <Textarea
//                                                 placeholder="country style"
//                                                 {...field}
//                                             />
//                                         </FormControl>
//                                         <FormDescription>
//                                             A description of the music you want
//                                             to generate.
//                                         </FormDescription>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <Accordion type="single" collapsible>
//                                 <AccordionItem value="item-1">
//                                     <AccordionTrigger>
//                                         Custom options
//                                     </AccordionTrigger>
//                                     <AccordionContent className="flex flex-1 flex-col space-y-8 p-4">
//                                         <FormField
//                                             control={form.control}
//                                             name="model_version"
//                                             render={({ field }) => (
//                                                 <FormItem className="space-y-3">
//                                                     <FormLabel>
//                                                         Model version
//                                                     </FormLabel>
//                                                     <FormDescription>
//                                                         Choose a model version
//                                                         to remix your track.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <RadioGroup
//                                                             onValueChange={
//                                                                 field.onChange
//                                                             }
//                                                             value={field.value}
//                                                             className="flex flex-col space-y-1"
//                                                         >
//                                                             {styleRemixModels.map(
//                                                                 (model) => (
//                                                                     <FormItem
//                                                                         key={
//                                                                             model.name
//                                                                         }
//                                                                         className="flex items-center space-x-3 space-y-0"
//                                                                     >
//                                                                         <FormControl>
//                                                                             <RadioGroupItem
//                                                                                 value={
//                                                                                     model.name
//                                                                                 }
//                                                                             />
//                                                                         </FormControl>
//                                                                         <FormLabel className="font-normal">
//                                                                             {
//                                                                                 model.name
//                                                                             }
//                                                                         </FormLabel>
//                                                                     </FormItem>
//                                                                 ),
//                                                             )}
//                                                         </RadioGroup>
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="multi_band_diffusion"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                                                     <FormControl>
//                                                         <Checkbox
//                                                             checked={
//                                                                 field.value
//                                                             }
//                                                             onCheckedChange={
//                                                                 field.onChange
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <div className="space-y-1 leading-none">
//                                                         <FormLabel>
//                                                             Multi-band diffusion
//                                                         </FormLabel>
//                                                         <FormDescription>
//                                                             If checked, the
//                                                             EnCodec tokens will
//                                                             be decoded with
//                                                             MultiBand Diffusion.
//                                                             Only works with
//                                                             non-stereo models.
//                                                         </FormDescription>
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="normalization_strategy"
//                                             render={({ field }) => (
//                                                 <FormItem className="space-y-3">
//                                                     <FormLabel>
//                                                         Clip mode
//                                                     </FormLabel>
//                                                     <FormDescription>
//                                                         Strategy for normalizing
//                                                         audio.
//                                                     </FormDescription>
//                                                     <Select
//                                                         onValueChange={
//                                                             field.onChange
//                                                         }
//                                                         defaultValue={
//                                                             field.value
//                                                         }
//                                                     >
//                                                         <FormControl>
//                                                             <SelectTrigger>
//                                                                 <SelectValue placeholder="Choose normalization strategy" />
//                                                             </SelectTrigger>
//                                                         </FormControl>
//                                                         <SelectContent>
//                                                             {[
//                                                                 'loudness',
//                                                                 'clip',
//                                                                 'peak',
//                                                                 'rms',
//                                                             ].map(
//                                                                 (normStrat) => (
//                                                                     <SelectItem
//                                                                         key={
//                                                                             normStrat
//                                                                         }
//                                                                         value={
//                                                                             normStrat
//                                                                         }
//                                                                     >
//                                                                         {normStrat[0]?.toUpperCase() +
//                                                                             normStrat.slice(
//                                                                                 1,
//                                                                             )}
//                                                                     </SelectItem>
//                                                                 ),
//                                                             )}
//                                                         </SelectContent>
//                                                     </Select>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="beat_sync_threshold"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormLabel>
//                                                         Beat sync threshold
//                                                     </FormLabel>
//                                                     <FormDescription>
//                                                         When beat syncing, if
//                                                         the gap between
//                                                         generated downbeat
//                                                         timing and input audio
//                                                         downbeat timing is
//                                                         larger than this,
//                                                         consider the beats are
//                                                         not corresponding. If
//                                                         empty or -1,
//                                                         &apos;1.1/(bpm/60)&apos;
//                                                         will be used as the
//                                                         value. 0.75 is a good
//                                                         value to set.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="number"
//                                                             {...field}
//                                                             disabled={
//                                                                 form.formState
//                                                                     .isSubmitting
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="large_chord_voca"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                                                     <FormControl>
//                                                         <Checkbox
//                                                             checked={
//                                                                 field.value
//                                                             }
//                                                             onCheckedChange={
//                                                                 field.onChange
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <div className="space-y-1 leading-none">
//                                                         <FormLabel>
//                                                             Multi-band diffusion
//                                                         </FormLabel>
//                                                         <FormDescription>
//                                                             If checked, more
//                                                             chords like 7th,
//                                                             diminished are used.
//                                                             Else, only the 12
//                                                             major and 12 minor
//                                                             chords are used.
//                                                         </FormDescription>
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="chroma_coefficient"
//                                             render={({ field }) => (
//                                                 <FormItem className="space-y-3">
//                                                     <div className="space-y-1 leading-none">
//                                                         <FormLabel>
//                                                             Chroma coefficient:{' '}
//                                                             {field.value}
//                                                         </FormLabel>
//                                                         <FormDescription>
//                                                             Coefficient value
//                                                             multiplied to
//                                                             multi-hot chord
//                                                             chroma.
//                                                         </FormDescription>
//                                                     </div>
//                                                     <FormControl>
//                                                         <Slider
//                                                             {...field}
//                                                             onValueChange={(
//                                                                 v,
//                                                             ) =>
//                                                                 field.onChange(
//                                                                     v[0],
//                                                                 )
//                                                             }
//                                                             value={[
//                                                                 field.value,
//                                                             ]}
//                                                             min={0.5}
//                                                             max={2}
//                                                             step={0.01}
//                                                             className="max-w-64"
//                                                         />
//                                                     </FormControl>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="top_k"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormLabel>Top k</FormLabel>
//                                                     <FormDescription>
//                                                         Reduces sampling to the
//                                                         k most likely tokens.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="number"
//                                                             {...field}
//                                                             disabled={
//                                                                 form.formState
//                                                                     .isSubmitting
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="top_p"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormLabel>Top p</FormLabel>
//                                                     <FormDescription>
//                                                         Reduces sampling to
//                                                         tokens with cumulative
//                                                         probability of p. When
//                                                         set to `0` (default),
//                                                         top_k sampling is used.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="number"
//                                                             {...field}
//                                                             disabled={
//                                                                 form.formState
//                                                                     .isSubmitting
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="temperature"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormLabel>
//                                                         Continuation start
//                                                     </FormLabel>
//                                                     <FormDescription>
//                                                         Controls the
//                                                         &apos;conservativeness&apos;
//                                                         of the sampling process.
//                                                         Higher temperature means
//                                                         more diversity.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="number"
//                                                             {...field}
//                                                             disabled={
//                                                                 form.formState
//                                                                     .isSubmitting
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="classifier_free_guidance"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormLabel>
//                                                         Classifier-free guidance
//                                                     </FormLabel>
//                                                     <FormDescription>
//                                                         Increases the influence
//                                                         of inputs on the output.
//                                                         Higher values produce
//                                                         lower-varience outputs
//                                                         that adhere more closely
//                                                         to inputs.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="number"
//                                                             {...field}
//                                                             disabled={
//                                                                 form.formState
//                                                                     .isSubmitting
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="seed"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormLabel>Seed</FormLabel>
//                                                     <FormDescription>
//                                                         Seed for random number
//                                                         generator. If empty or
//                                                         -1, a random seed will
//                                                         be used.
//                                                     </FormDescription>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="number"
//                                                             {...field}
//                                                             disabled={
//                                                                 form.formState
//                                                                     .isSubmitting
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="return_instrumental"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                                                     <FormControl>
//                                                         <Checkbox
//                                                             checked={
//                                                                 field.value
//                                                             }
//                                                             onCheckedChange={
//                                                                 field.onChange
//                                                             }
//                                                         />
//                                                     </FormControl>
//                                                     <div className="space-y-1 leading-none">
//                                                         <FormLabel>
//                                                             Return instrumental
//                                                         </FormLabel>
//                                                         <FormDescription>
//                                                             If checked, the
//                                                             instrumental audio
//                                                             will also be
//                                                             returned.
//                                                         </FormDescription>
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                         <FormField
//                                             control={form.control}
//                                             name="output_format"
//                                             render={({ field }) => (
//                                                 <FormItem className="space-y-3">
//                                                     <FormLabel>
//                                                         Output format
//                                                     </FormLabel>
//                                                     <FormDescription>
//                                                         Output format for
//                                                         generated audio.
//                                                     </FormDescription>
//                                                     <Select
//                                                         onValueChange={
//                                                             field.onChange
//                                                         }
//                                                         value={field.value}
//                                                     >
//                                                         <FormControl>
//                                                             <SelectTrigger>
//                                                                 <SelectValue placeholder="Choose output format" />
//                                                             </SelectTrigger>
//                                                         </FormControl>
//                                                         <SelectContent>
//                                                             {['mp3', 'wav'].map(
//                                                                 (format) => (
//                                                                     <SelectItem
//                                                                         key={
//                                                                             format
//                                                                         }
//                                                                         value={
//                                                                             format
//                                                                         }
//                                                                     >
//                                                                         {format.toUpperCase()}
//                                                                     </SelectItem>
//                                                                 ),
//                                                             )}
//                                                         </SelectContent>
//                                                     </Select>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </AccordionContent>
//                                 </AccordionItem>
//                             </Accordion>
//                         </motion.div>
//                     )}
//
//                     {currentStep === 2 && (
//                         <motion.div
//                             className="flex flex-1 flex-col space-y-8"
//                             initial={{
//                                 x: delta >= 0 ? '50%' : '-50%',
//                                 opacity: 0,
//                             }}
//                             animate={{ x: 0, opacity: 1 }}
//                             transition={{ duration: 0.3, ease: 'easeInOut' }}
//                         >
//                             <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
//                                 Submission complete
//                             </h2>
//                             <p className="leading-7 text-muted-foreground [&:not(:first-child)]:mt-6">
//                                 Your track has been submitted for processing.{' '}
//                                 <a
//                                     href={siteConfig.paths.studio.newStyleRemix}
//                                     className={cn(
//                                         buttonVariants({
//                                             variant: 'link',
//                                         }),
//                                         'p-0',
//                                     )}
//                                 >
//                                     Remix a new track
//                                 </a>{' '}
//                                 or{' '}
//                                 <Link
//                                     href={siteConfig.paths.studio.styleRemix}
//                                     className={cn(
//                                         buttonVariants({
//                                             variant: 'link',
//                                         }),
//                                         'p-0',
//                                     )}
//                                 >
//                                     view the status
//                                 </Link>{' '}
//                                 of your newly submitted track.
//                             </p>
//                         </motion.div>
//                     )}
//                 </form>
//             </Form>
//
//             {/* Navigation */}
//             <div className="flex justify-between space-x-2 pb-4">
//                 {!form.formState.isSubmitSuccessful && (
//                     <>
//                         <Button
//                             type="button"
//                             onClick={prev}
//                             disabled={
//                                 currentStep === 0 || form.formState.isSubmitting
//                             }
//                             variant="outline"
//                             size="icon"
//                         >
//                             <ChevronLeft className="h-6 w-6" />
//                         </Button>
//                         <Button
//                             type="button"
//                             onClick={next}
//                             disabled={
//                                 currentStep === steps.length - 1 ||
//                                 form.formState.isSubmitting
//                             }
//                             variant="outline"
//                             size="icon"
//                         >
//                             {form.formState.isSubmitting ? (
//                                 <Loader2 className="h-5 w-5 animate-spin" />
//                             ) : (
//                                 <ChevronRight className="h-6 w-6" />
//                             )}
//                         </Button>
//                     </>
//                 )}
//                 {form.formState.isSubmitSuccessful && (
//                     <>
//                         <a
//                             href={siteConfig.paths.studio.newStyleRemix}
//                             className={buttonVariants({
//                                 variant: 'outline',
//                             })}
//                         >
//                             Remix new track
//                         </a>
//                         <Link
//                             href={siteConfig.paths.studio.styleRemix}
//                             className={buttonVariants({
//                                 variant: 'outline',
//                             })}
//                         >
//                             View tracks
//                         </Link>
//                     </>
//                 )}
//             </div>
//         </>
//     );
// };
