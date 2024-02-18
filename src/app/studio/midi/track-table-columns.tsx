'use client';

import { deleteTrack, downloadTrack } from '@/app/studio/actions';
import { Button, buttonVariants } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Track } from '@/models/track';
import { ColumnDef } from '@tanstack/react-table';
import JSZip from 'jszip';
import {
    ArrowUpDown,
    CheckCircle2,
    Download,
    Loader2,
    MoreHorizontal,
    Trash2,
    XCircle,
} from 'lucide-react';
import Link from 'next/link';

const getStatusIndicator = (
    status: 'processing' | 'succeeded' | 'failed' | 'canceled',
) => {
    switch (status) {
        case 'processing':
            return <Loader2 className="inline h-4 w-4 animate-spin" />;
        case 'succeeded':
            return <CheckCircle2 className="inline h-4 w-4" />;
        case 'failed':
            return <XCircle className="inline h-4 w-4" />;
        case 'canceled':
            return <Trash2 className="inline h-4 w-4" />;
    }
};

const handleDownload = async (trackId: string) => {
    try {
        const { data } = await downloadTrack({ trackId });
        if (data) {
            const zip = new JSZip();
            const promises = data.map((asset) =>
                fetch(asset.url)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const filename = `${
                            asset.type || 'track' + Date.now()
                        }.${blob.type.split('/')[1]}`;
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
        }
    } catch (error) {
        // keep this in production to track user-reported errors
        console.error('Failed to download track', error);
    }
};

const handleDelete = async (trackId: string) => {
    try {
        await deleteTrack({ trackId });
    } catch (error) {
        // keep this in production to track user-reported errors
        console.error('Failed to delete track', error);
    }
};

export const trackTableColumns: ColumnDef<Track>[] = [
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
            <Link
                href={`/studio/track/midi/${row.original.id}`}
                className={cn(
                    buttonVariants({ variant: 'link' }),
                    'text-foreground',
                )}
            >
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: 'midiTranscriptionStatus',
        header: 'Status',
        cell: ({ row }) => (
            <div className="capitalize">
                <span className="mr-2">
                    {getStatusIndicator(
                        row.getValue('midiTranscriptionStatus'),
                    )}
                </span>
                {row.getValue('midiTranscriptionStatus')}
            </div>
        ),
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const track = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={async () => await handleDownload(track.id)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download track
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => await handleDelete(track.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete track
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
