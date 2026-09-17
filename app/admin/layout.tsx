import { signOutAction } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const user = await requireAdmin();

	return (
		<div className="admin-shell">
			<aside className="admin-sidebar">
				<div className="admin-brand">
					<p className="eyebrow">ADMIN</p>
					<strong>AllGreeceWeather</strong>
				</div>

				<nav className="admin-sidebar-nav" aria-label="Admin navigation">
					<a href="/admin">Πίνακας Ελέχου</a>

					<div className="admin-nav-group">
						<span>Περιεχόμενο</span>
						<a href="/admin/posts">Άρθρα</a>
						<a href="/admin/tags">Ετικέτες</a>
						<a href="/admin/media">Πολυμέσα</a>
					</div>
				</nav>

				<div className="admin-sidebar-footer">
					<span>{user.email}</span>

					<a href="/">← Δημόσια σελίδα</a>

					<form action={signOutAction}>
						<button type="submit">Αποσύνδεση</button>
					</form>
				</div>
			</aside>

			<main className="admin-main">{children}</main>
		</div>
	);
}
