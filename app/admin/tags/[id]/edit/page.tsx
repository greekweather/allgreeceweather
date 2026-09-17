import { notFound } from "next/navigation";
import { updateTagAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const supabase = await createClient();

	const { data: tag, error } = await supabase
		.from("tags")
		.select("id,name,slug")
		.eq("id", id)
		.single();

	if (error || !tag) {
		notFound();
	}

	return (
		<>
			<header className="admin-page-header">
				<div>
					<p className="eyebrow">ΠΕΡΙΕΧΟΜΕΝΟ</p>
					<h1>Επεξεργασία ετικέτας</h1>
					<p>Τροποποίησε το όνομα της ετικέτας.</p>
				</div>

				<a className="button secondary" href="/admin/tags">
					← Επιστροφή
				</a>
			</header>

			<section className="admin-section">
				<form action={updateTagAction} className="form-card form-grid">
					<input type="hidden" name="id" value={tag.id} />

					<div className="form-field">
						<label htmlFor="name">Όνομα ετικέτας</label>
						<input
							id="name"
							name="name"
							type="text"
							maxLength={80}
							required
							defaultValue={tag.name}
						/>
					</div>

					<div className="form-field">
						<label htmlFor="slug">Slug</label>
						<input id="slug" type="text" value={tag.slug} disabled readOnly />
						<small>Το slug παραμένει σταθερό ώστε να μη δημιουργούνται σπασμένα links.</small>
					</div>

					<div className="form-actions">
						<a className="button secondary" href="/admin/tags">
							Ακύρωση
						</a>

						<button className="button" type="submit">
							Αποθήκευση αλλαγών
						</button>
					</div>
				</form>
			</section>
		</>
	);
}
