"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { athensLocalToUTC } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { normalizePublishedAt, parseTags, postInputSchema } from "@/lib/validation";

function formDataToInput(formData: FormData) {
	return postInputSchema.parse({
		title: formData.get("title"),
		slug: formData.get("slug"),
		description: formData.get("description") ?? "",
		content: formData.get("content"),
		image_url: formData.get("image_url") ?? "",
		image_alt: formData.get("image_alt") ?? "",
		tags: formData.get("tags") ?? "",
		published: formData.get("published") === "on",
		published_at: formData.get("published_at") ?? "",
	});
}

export async function createPostAction(formData: FormData) {
	await requireAdmin();
	const supabase = await createClient();
	const input = formDataToInput(formData);
	const normalizedPublishedAt = normalizePublishedAt(input.published_at, input.published);
	const publishedAt = normalizedPublishedAt ? athensLocalToUTC(normalizedPublishedAt) : null;

	const { error } = await supabase.from("posts").insert({
		title: input.title,
		slug: input.slug,
		description: input.description,
		content: input.content,
		image_url: input.image_url || null,
		image_alt: input.image_alt,
		tags: parseTags(input.tags),
		published: input.published,
		published_at: publishedAt,
	});
	if (error) throw new Error(error.code === "23505" ? "Το slug υπάρχει ήδη." : error.message);

	revalidatePath("/");
	revalidatePath("/posts");
	revalidatePath(`/posts/${input.slug}`);
	redirect("/admin");
}

export async function updatePostAction(formData: FormData) {
	await requireAdmin();
	const supabase = await createClient();
	const id = String(formData.get("id") || "");
	if (!id) throw new Error("Λείπει το ID του άρθρου.");
	const input = formDataToInput(formData);
	const normalizedPublishedAt = normalizePublishedAt(input.published_at, input.published);
	const publishedAt = normalizedPublishedAt ? athensLocalToUTC(normalizedPublishedAt) : null;

	const { data: oldPost, error: oldError } = await supabase
		.from("posts")
		.select("slug")
		.eq("id", id)
		.single();
	if (oldError || !oldPost) throw new Error("Το άρθρο δεν βρέθηκε.");

	const { error } = await supabase
		.from("posts")
		.update({
			title: input.title,
			slug: input.slug,
			description: input.description,
			content: input.content,
			image_url: input.image_url || null,
			image_alt: input.image_alt,
			tags: parseTags(input.tags),
			published: input.published,
			published_at: publishedAt,
		})
		.eq("id", id);
	if (error) throw new Error(error.code === "23505" ? "Το slug υπάρχει ήδη." : error.message);

	revalidatePath("/");
	revalidatePath("/posts");
	revalidatePath(`/posts/${oldPost.slug}`);
	revalidatePath(`/posts/${input.slug}`);
	redirect("/admin");
}

export async function deletePostAction(formData: FormData) {
	await requireAdmin();
	const supabase = await createClient();
	const id = String(formData.get("id") || "");
	if (!id) throw new Error("Λείπει το ID του άρθρου.");
	const { data: post } = await supabase.from("posts").select("slug").eq("id", id).single();
	const { error } = await supabase.from("posts").delete().eq("id", id);
	if (error) throw new Error(error.message);
	revalidatePath("/");
	revalidatePath("/posts");
	if (post?.slug) revalidatePath(`/posts/${post.slug}`);
	redirect("/admin");
}

export async function signOutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/admin/login");
}
