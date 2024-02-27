type GenerationLayoutProps = {
    children: React.ReactNode;
};

const GenerationLayout = ({ children }: GenerationLayoutProps) => {
    return (
        <section className="container relative flex h-full max-w-screen-lg flex-col space-y-4 py-4">
            {children}
        </section>
    );
};

export default GenerationLayout;
