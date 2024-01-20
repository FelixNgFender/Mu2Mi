export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: ({ className }: { className: string }) => JSX.Element;
    label?: string;
}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}
