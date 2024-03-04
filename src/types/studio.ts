import { schema } from '@/infra';
import { StaticImageData } from 'next/image';

const {
    trackAssetType,
    trackStatusColumns: trackStatusColumnsDatabase,
    trackStatusEnum,
} = schema;

export interface NavItem {
    title: string;
    href?: string;
    external?: boolean;
    icon?: JSX.Element;
    label?: string;
}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

export type Preset = {
    id: string;
    icon: StaticImageData;
    name: string;
    description: string;
    labels: string[];
    onClick: () => void;
};

export const trackStatusColumns = trackStatusColumnsDatabase;

export type TrackStatusColumn = (typeof trackStatusColumns)[number];

export const trackStatuses = trackStatusEnum.enumValues;

export type TrackStatus = (typeof trackStatuses)[number];

export type TrackAssetType = (typeof trackAssetType.enumValues)[number];
