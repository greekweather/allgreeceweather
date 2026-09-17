import { notFound } from "next/navigation";
import { updatePostAction } from "@/app/actions";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const { id } = await params;
	const supabase = await createClient();
	const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
	if (error || !data) notFound();
	const publishedAt = data.published_at
		? new Date(data.published_at)
				.toLocaleString("sv-SE", { timeZone: "Europe/Athens" })
				.replace(" ", "T")
				.slice(0, 16)
		: "";
	return (
		<section className="section">
			<div className="container">
				<div className="section-heading">
					<h2>Επεξεργασία άρθρου</h2>
				</div>
				<PostForm
					action={updatePostAction}
					post={{
						...data,
						id: data.id,
						tags: (data.tags ?? []).join(", "),
						image_url: data.image_url ?? "",
						published_at: publishedAt,
					}}
				/>
			</div>
		</section>
	);
}
