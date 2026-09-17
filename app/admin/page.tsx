import { deletePostAction, signOutAction } from "@/app/actions";
import { formatDate } from "@/components/PostCard";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
	const user = await requireAdmin();
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("posts")
		.select("id,title,slug,published,published_at,views,updated_at")
		.order("updated_at", { ascending: false });
	if (error) throw new Error(error.message);
	return (
		<>
			<section className="admin-header">
				<div className="container">
					<p className="eyebrow">ADMIN</p>
					<h1>AllGreeceWeather</h1>
					<div className="admin-nav">
						<span>{user.email}</span>
						<a className="button secondary" href="/admin">
							Άρθρα
						</a>
						<a className="button secondary" href="/admin/posts/new">
							Νέο άρθρο
						</a>
						<form action={signOutAction}>
							<button className="button" type="submit">
								Αποσύνδεση
							</button>
						</form>
					</div>
				</div>
			</section>
			<section className="section">
				<div className="container">
					<div className="form-card admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Τίτλος</th>
									<th>Κατάσταση</th>
									<th>Δημοσίευση</th>
									<th>Προβολές</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{(data ?? []).map((post) => (
									<tr key={post.id}>
										<td>
											<strong>{post.title}</strong>
											<br />
											<small>{post.slug}</small>
										</td>
										<td>
											<span className={`status ${post.published ? "published" : "draft"}`}>
												{post.published ? "Δημοσιευμένο" : "Πρόχειρο"}
											</span>
										</td>
										<td>{formatDate(post.published_at)}</td>
										<td>{post.views}</td>
										<td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
											<a className="button secondary" href={`/admin/posts/${post.id}/edit`}>
												Επεξεργασία
											</a>
											<form action={deletePostAction}>
												<input type="hidden" name="id" value={post.id} />
												<button className="button danger" type="submit">
													Διαγραφή
												</button>
											</form>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{!data?.length && <p>Δεν υπάρχουν άρθρα.</p>}
					</div>
				</div>
			</section>
		</>
	);
}
