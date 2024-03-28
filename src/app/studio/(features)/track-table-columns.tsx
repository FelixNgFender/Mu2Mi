'use client';

import {
    deleteUserTrack,
    downloadUserTrackAssets,
    shareUserTrack,
    updateUserTrack,
} from '@/app/studio/actions';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
// import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { siteConfig } from '@/config/site';
import { umami } from '@/lib/analytics';
import { cn, formatValidationErrors } from '@/lib/utils';
import type { ReturnedTrack } from '@/models/track';
import { TrackStatus, TrackStatusColumn } from '@/types/studio';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import JSZip from 'jszip';
import {
    ArrowUpDown,
    CheckCircle,
    Copy,
    Download,
    Globe,
    GlobeLock,
    Loader2,
    Pencil,
    Save,
    Share2,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { EditTrackFormType, editTrackFormSchema } from '../schemas';

const getStatusIndicator = (status: TrackStatus) => {
    switch (status) {
        case 'processing':
            return <Loader2 className="inline h-4 w-4 animate-spin" />;
        case 'succeeded':
            return <CheckCircle className="inline h-4 w-4" />;
        case 'failed':
            return <XCircle className="inline h-4 w-4" />;
        case 'canceled':
            return <Trash2 className="inline h-4 w-4" />;
    }
};

const DownloadButton = ({ track }: { track: ReturnedTrack }) => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDownload = async () => {
        const { data, validationErrors, serverError } =
            await downloadUserTrackAssets({ trackId: track.id });

        if (validationErrors) {
            throw new Error(formatValidationErrors(validationErrors));
        }

        if (serverError || !data) {
            throw new Error(serverError);
        }

        const zip = new JSZip();
        const promises = data.map((asset) =>
            fetch(asset.url)
                .then((response) => response.blob())
                .then((blob) => {
                    const filename = `${asset.type || 'track' + Date.now()}.${
                        blob.type.split('/')[1]
                    }`;
                    zip.file(filename, blob);
                }),
        );
        await Promise.all(promises);
        const archive = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(archive);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'track.zip';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Button
            title="Download track"
            variant="outline"
            disabled={isPending}
            size="icon"
            onClick={() =>
                startTransition(async () => {
                    try {
                        await handleDownload();
                    } catch (error) {
                        toast({
                            variant: 'destructive',
                            title: 'Uh oh! Something went wrong.',
                            description: (error as Error).message,
                        });
                    }
                })
            }
            data-umami-event={umami.downloadTrack.name}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            <span className="sr-only">
                {isPending ? 'Downloading...' : 'Download track'}
            </span>
        </Button>
    );
};

const EditButton = ({ track }: { track: ReturnedTrack }) => {
    const { toast } = useToast();
    const form = useForm<EditTrackFormType>({
        resolver: zodResolver(editTrackFormSchema),
        defaultValues: {
            name: track.name,
            public: track.public,
        },
    });

    const onEditSave: SubmitHandler<EditTrackFormType> = async (data) => {
        try {
            const { validationErrors, serverError } = await updateUserTrack({
                trackId: track.id,
                name: data.name,
                public: data.public,
            });

            if (validationErrors) {
                throw new Error(formatValidationErrors(validationErrors));
            }

            if (serverError) {
                throw new Error(serverError);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message,
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    title="Edit track"
                    variant="outline"
                    size="icon"
                >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit track</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit track details</DialogTitle>
                    <DialogDescription>
                        Make changes to your track details. Click save when
                        you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="edit-track"
                        onSubmit={form.handleSubmit(onEditSave)}
                    >
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                className="col-span-3"
                                                {...field}
                                                disabled={
                                                    form.formState.isSubmitting
                                                }
                                                aria-disabled={
                                                    form.formState.isSubmitting
                                                }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="public"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">
                                            Public?
                                        </FormLabel>
                                        <Checkbox
                                            className="col-span-3"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                            aria-disabled={
                                                form.formState.isSubmitting
                                            }
                                        />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
                <DialogFooter className="space-y-2">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            className="mt-2"
                            disabled={form.formState.isSubmitting}
                            aria-disabled={form.formState.isSubmitting}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        title={
                            form.formState.isSubmitting ? 'Saving...' : 'Save'
                        }
                        type="submit"
                        form="edit-track"
                        disabled={form.formState.isSubmitting}
                        aria-disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ShareButton = ({ track }: { track: ReturnedTrack }) => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const getTrackPublicLink = () => {
        if (typeof window === 'undefined') {
            return '';
        }
        if (track.midiTranscriptionStatus) {
            return `${window.location.origin}${siteConfig.paths.preview.midi}/${track.id}`;
        }
        if (track.lyricsTranscriptionStatus) {
            return `${window.location.origin}${siteConfig.paths.preview.karaoke}/${track.id}`;
        }
        return `${window.location.origin}${siteConfig.paths.preview.track}/${track.id}`;
    };

    const handleShare = async () => {
        const { validationErrors, serverError } = await shareUserTrack({
            trackId: track.id,
            isPublic: !track.public,
        });

        if (validationErrors) {
            throw new Error(formatValidationErrors(validationErrors));
        }

        if (serverError) {
            throw new Error(serverError);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button title="Share track" variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share track</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share track</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view the track.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col">
                    <div className="flex items-center justify-between space-x-2 pb-6 pt-4">
                        <p>
                            Current visibility:{' '}
                            <span className="font-bold">
                                {track.public ? 'Public' : 'Private'}
                            </span>
                        </p>
                        <Button
                            title="Toggle visibility"
                            variant="outline"
                            disabled={isPending}
                            onClick={() =>
                                startTransition(async () => {
                                    try {
                                        await handleShare();
                                        toast({
                                            title: `${track.name} is now ${
                                                track.public
                                                    ? 'private'
                                                    : 'public'
                                            }!`,
                                        });
                                    } catch (error) {
                                        toast({
                                            variant: 'destructive',
                                            title: 'Uh oh! Something went wrong.',
                                            description: (error as Error)
                                                .message,
                                        });
                                    }
                                })
                            }
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : track.public ? (
                                <Globe className="mr-2 h-4 w-4" />
                            ) : (
                                <GlobeLock className="mr-2 h-4 w-4" />
                            )}
                            Make {track.public ? 'private' : 'public'}
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Track public link
                            </Label>
                            <Input
                                id="link"
                                defaultValue={getTrackPublicLink()}
                                readOnly
                                disabled={!track.public}
                            />
                        </div>
                        <Button
                            title="Copy link"
                            type="submit"
                            size="sm"
                            className="px-3"
                            disabled={!track.public}
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(
                                        getTrackPublicLink(),
                                    );
                                    toast({
                                        title: 'Link copied!',
                                    });
                                } catch (error) {
                                    toast({
                                        variant: 'destructive',
                                        title: 'Uh oh! Something went wrong.',
                                        description: (error as Error).message,
                                    });
                                }
                            }}
                            data-umami-event={umami.shareTrack.name}
                        >
                            <span className="sr-only">Copy</span>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const DeleteButton = ({ track }: { track: ReturnedTrack }) => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        const { validationErrors, serverError } = await deleteUserTrack({
            trackId: track.id,
        });

        if (validationErrors) {
            throw new Error(formatValidationErrors(validationErrors));
        }

        if (serverError) {
            throw new Error(serverError);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete track</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm track deletion</DialogTitle>
                    <DialogDescription>
                        This irreversible action will delete the track and all
                        related assets.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="space-y-2">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            className="mt-2"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={isPending}
                        onClick={() =>
                            startTransition(async () => {
                                try {
                                    await handleDelete();
                                } catch (error) {
                                    toast({
                                        variant: 'destructive',
                                        title: 'Uh oh! Something went wrong.',
                                        description: (error as Error).message,
                                    });
                                }
                            })
                        }
                        data-umami-event={umami.deleteTrack.name}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete track
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const trackTableColumnsBuiler = (
    filter: TrackStatusColumn,
    basePreviewPath?: string,
    callback?: string,
) => {
    const trackTableColumns: ColumnDef<ReturnedTrack>[] = [
        // {
        //     id: 'select',
        //     header: ({ table }) => (
        //         <Checkbox
        //             checked={
        //                 table.getIsAllPageRowsSelected() ||
        //                 (table.getIsSomePageRowsSelected() && 'indeterminate')
        //             }
        //             onCheckedChange={(value) =>
        //                 table.toggleAllPageRowsSelected(!!value)
        //             }
        //             aria-label="Select all"
        //         />
        //     ),
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={(value) => row.toggleSelected(!!value)}
        //             aria-label="Select row"
        //         />
        //     ),
        //     enableSorting: false,
        //     enableHiding: false,
        // },
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Track Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="whitespace-nowrap">
                    {basePreviewPath ? (
                        <Link
                            href={
                                callback
                                    ? `${basePreviewPath}/${row.original.id}?callback=${callback}`
                                    : `${basePreviewPath}/${row.original.id}`
                            }
                            className={cn(
                                buttonVariants({ variant: 'link' }),
                                'text-foreground',
                            )}
                        >
                            {row.original.name}
                        </Link>
                    ) : (
                        <span>{row.original.name}</span>
                    )}
                    {row.original.public && (
                        <Badge variant="secondary">Public</Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: filter,
            header: 'Status',
            cell: ({ row }) => (
                <div className="whitespace-nowrap capitalize">
                    <span className="mr-2">
                        {getStatusIndicator(row.getValue(filter))}
                    </span>
                    {row.getValue(filter)}
                </div>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const track = row.original;

                return (
                    <div className="flex justify-end space-x-2">
                        <DownloadButton track={track} />
                        <EditButton track={track} />
                        <ShareButton track={track} />
                        <DeleteButton track={track} />
                    </div>
                );
            },
        },
    ];
    return trackTableColumns;
};
