export default function SettingsShellPage({ icon, title, description }) {
    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                    <p className="fs-1 mb-2">{icon}</p>
                    <p className="fs-5 mb-1">{title}</p>
                    <p className="text-muted mb-0">{description}</p>
                </div>
            </div>
        </section>
    );
}
