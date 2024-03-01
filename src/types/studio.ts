import {
    TrackTableStatusColumn as TrackTableStatusColumnDatabase,
    trackAssetType,
    trackStatusEnum,
} from '@/infra/schema';
import { StaticImageData } from 'next/image';

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

export type TrackStatusColumn = TrackTableStatusColumnDatabase;

export const trackStatuses = trackStatusEnum.enumValues;

export type TrackStatus = (typeof trackStatuses)[number];

export type TrackAssetType = (typeof trackAssetType.enumValues)[number];
