import { createClient } from "@/lib/supabase/server";

export type Post = {
	id: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	image_url: string | null;
	image_alt: string;
	tags: string[];
	published: boolean;
	published_at: string | null;
	views: number;
	created_at: string;
	updated_at: string;
};

export async function getPublishedPosts(limit?: number) {
	const supabase = await createClient();
	let query = supabase
		.from("posts")
		.select(
			"id,title,slug,description,content,image_url,image_alt,tags,published,published_at,views,created_at,updated_at",
		)
		.eq("published", true)
		.not("published_at", "is", null)
		.lte("published_at", new Date().toISOString())
		.order("published_at", { ascending: false });
	if (limit) query = query.limit(limit);
	const { data, error } = await query;
	if (error) throw new Error("Δεν ήταν δυνατή η φόρτωση των άρθρων.");
	return (data ?? []) as Post[];
}

export async function getPublishedPostBySlug(slug: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("posts")
		.select(
			"id,title,slug,description,content,image_url,image_alt,tags,published,published_at,views,created_at,updated_at",
		)
		.eq("slug", slug)
		.eq("published", true)
		.not("published_at", "is", null)
		.lte("published_at", new Date().toISOString())
		.maybeSingle();
	if (error) throw new Error("Δεν ήταν δυνατή η φόρτωση του άρθρου.");
	return data as Post | null;
}
