"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type FormPost = {
	id?: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	image_url: string;
	image_alt: string;
	tag_ids: string[];
	published: boolean;
	published_at: string;
};

export function PostForm({
	post,
	action,
	availableTags,
}: {
	post?: FormPost;
	action: (formData: FormData) => void | Promise<void>;
	availableTags: {
		id: string;
		name: string;
	}[];
}) {
	const [imageUrl, setImageUrl] = useState(post?.image_url ?? "");
	const [imageAlt, setImageAlt] = useState(post?.image_alt ?? "");
	return (
		<form action={action} className="form-card form-grid">
			{post?.id && <input type="hidden" name="id" value={post.id} />}
			<div className="form-row">
				<div className="form-field">
					<label htmlFor="title">Τίτλος *</label>
					<input id="title" name="title" required maxLength={180} defaultValue={post?.title} />
				</div>
				<div className="form-field">
					<label htmlFor="slug">Slug *</label>
					<input
						id="slug"
						name="slug"
						required
						maxLength={120}
						pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
						defaultValue={post?.slug}
					/>
				</div>
			</div>
			<div className="form-field">
				<label htmlFor="description">Περιγραφή</label>
				<textarea
					id="description"
					name="description"
					maxLength={400}
					style={{ minHeight: 100 }}
					defaultValue={post?.description}
				/>
			</div>
			<div className="form-field">
				<label htmlFor="content">Άρθρο (Markdown)</label>
				<textarea
					id="content"
					name="content"
					required
					defaultValue={post?.content}
					style={{ minHeight: 420, fontFamily: "ui-monospace,SFMono-Regular,Consolas,monospace" }}
				/>
			</div>
			<div className="form-row">
				<div className="form-field">
					<label htmlFor="image_url">Image URL</label>
					<input
						id="image_url"
						name="image_url"
						value={imageUrl}
						onChange={(e) => setImageUrl(e.target.value)}
					/>
				</div>
				<div className="form-field">
					<label htmlFor="image_alt">Image alt</label>
					<input
						id="image_alt"
						name="image_alt"
						maxLength={180}
						value={imageAlt}
						onChange={(e) => setImageAlt(e.target.value)}
					/>
				</div>
			</div>
			<ImageUpload
				onUploaded={(url, alt) => {
					setImageUrl(url);
					if (!imageAlt) setImageAlt(alt);
				}}
			/>
			<div className="form-field">
				<p className="form-label">Ετικέτες</p>

				<div className="tag-selector">
					{availableTags.length > 0 ? (
						availableTags.map((tag) => (
							<label className="tag-option" key={tag.id}>
								<input
									type="checkbox"
									name="tag_ids"
									value={tag.id}
									defaultChecked={post?.tag_ids.includes(tag.id)}
								/>
								<span>{tag.name}</span>
							</label>
						))
					) : (
						<p>Δεν υπάρχουν διαθέσιμες ετικέτες.</p>
					)}
				</div>
			</div>
			<div className="form-row">
				<div className="form-field">
					<label htmlFor="published_at">Ημερομηνία/ώρα δημοσίευσης</label>
					<input
						id="published_at"
						name="published_at"
						type="datetime-local"
						defaultValue={post?.published_at}
					/>
				</div>
				<div className="form-field" style={{ alignSelf: "end" }}>
					<label className="publish-option">
						<input type="checkbox" name="published" defaultChecked={post?.published} />
						<span>Δημοσιευμένο</span>
					</label>
				</div>
			</div>
			<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
				<button className="button" type="submit">
					Αποθήκευση
				</button>
				<a className="button secondary" href="/admin">
					Ακύρωση
				</a>
			</div>
		</form>
	);
}
