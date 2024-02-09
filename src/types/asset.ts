import { trackAssetType } from '@/db/schema';

export type Asset = {
    id: string;
    url: string;
    type: (typeof trackAssetType.enumValues)[number];
};
