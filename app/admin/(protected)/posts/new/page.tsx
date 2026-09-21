import { createPostAction } from "@/app/actions";
import { PostForm } from "@/components/admin/PostForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewPostPage() {
	const supabase = await createClient();

	const { data: tags, error } = await supabase
		.from("tags")
		.select("id,name")
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return (
		<section className="section">
			<div className="container">
				<div className="section-heading">
					<h2>Νέο άρθρο</h2>
				</div>

				<PostForm action={createPostAction} availableTags={tags ?? []} />
			</div>
		</section>
	);
}
