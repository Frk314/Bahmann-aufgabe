export default function Spinner({ className = "h-8 w-8" }) {
    return (
        <div
        role="status"
        aria-label="Wird geladen"
        className={`${className} animate-spin rounded-full border-4 border-border border-t-primary`}
        />
    );
}