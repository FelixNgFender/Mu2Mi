type TrackLayoutProps = {
    children: React.ReactNode;
};

const TrackLayout = ({ children }: TrackLayoutProps) => {
    return (
        <section className="container relative flex h-full flex-1 flex-col space-y-4 py-4">
            {children}
        </section>
    );
};

export default TrackLayout;
