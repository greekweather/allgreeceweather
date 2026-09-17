import { createTagAction } from "@/app/actions";

export default function NewTagPage() {
	return (
		<>
			<header className="admin-page-header">
				<div>
					<p className="eyebrow">ΠΕΡΙΕΧΟΜΕΝΟ</p>
					<h1>Νέα ετικέτα</h1>
					<p>Δημιούργησε μια νέα ετικέτα για τα άρθρα.</p>
				</div>

				<a className="button secondary" href="/admin/tags">
					← Επιστροφή
				</a>
			</header>

			<section className="admin-section">
				<form action={createTagAction} className="form-card form-grid">
					<div className="form-field">
						<label htmlFor="name">Όνομα ετικέτας</label>
						<input
							id="name"
							name="name"
							type="text"
							maxLength={80}
							required
							placeholder="π.χ. Κακοκαιρίες"
						/>
					</div>

					<div className="form-actions">
						<a className="button secondary" href="/admin/tags">
							Ακύρωση
						</a>

						<button className="button" type="submit">
							Δημιουργία ετικέτας
						</button>
					</div>
				</form>
			</section>
		</>
	);
}
