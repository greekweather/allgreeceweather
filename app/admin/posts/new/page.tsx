import { createPostAction } from "@/app/actions";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";

export default async function NewPostPage() {
	await requireAdmin();
	return (
		<section className="section">
			<div className="container">
				<div className="section-heading">
					<h2>Νέο άρθρο</h2>
				</div>
				<PostForm action={createPostAction} />
			</div>
		</section>
	);
}
