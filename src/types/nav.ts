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
