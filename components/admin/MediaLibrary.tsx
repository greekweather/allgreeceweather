"use client";

import Image from "next/image";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type MediaFile = {
	name: string;
	url: string;
	created_at: string | null;
	size: number | null;
	content_type: string | null;
};

export function MediaLibrary({
	initialFiles,
}: {
	initialFiles: MediaFile[];
}) {
	const [files, setFiles] = useState(initialFiles);
	const [uploading, setUploading] = useState(false);
	const [message, setMessage] = useState("");

	const supabase = createClient();

	async function uploadFile(file: File) {
		setUploading(true);
		setMessage("");

		const extension =
			file.name.split(".").pop()?.toLowerCase() || "jpg";

		const baseName =
			file.name
				.replace(/\.[^/.]+$/, "")
				.toLowerCase()
				.replace(/[^a-z0-9-_]+/g, "-")
				.replace(/^-+|-+$/g, "") || "image";

		const fileName = `${Date.now()}-${baseName}.${extension}`;

		const { error } = await supabase.storage
			.from("post-images")
			.upload(fileName, file, {
				cacheControl: "31536000",
				upsert: false,
				contentType: file.type,
			});

		if (error) {
			setMessage(`Σφάλμα upload: ${error.message}`);
			setUploading(false);
			return;
		}

		const { data: publicUrl } = supabase.storage
			.from("post-images")
			.getPublicUrl(fileName);

		setFiles((current) => [
			{
				name: fileName,
				url: publicUrl.publicUrl,
				created_at: new Date().toISOString(),
				size: file.size,
				content_type: file.type,
			},
			...current,
		]);

		setMessage("Η εικόνα ανέβηκε επιτυχώς.");
		setUploading(false);
	}

	async function deleteFile(name: string) {
		const confirmed = window.confirm(
			`Θέλεις σίγουρα να διαγράψεις την εικόνα "${name}";`,
		);

		if (!confirmed) return;

		const { error } = await supabase.storage
			.from("post-images")
			.remove([name]);

		if (error) {
			setMessage(`Σφάλμα διαγραφής: ${error.message}`);
			return;
		}

		setFiles((current) =>
			current.filter((file) => file.name !== name),
		);

		setMessage("Η εικόνα διαγράφηκε.");
	}

	async function copyUrl(url: string) {
		await navigator.clipboard.writeText(url);
		setMessage("Το URL αντιγράφηκε.");
	}

	return (
		<div>
			<div className="media-upload-card">
				<label className="media-upload-label">
					<span>
						{uploading ? "Ανέβασμα..." : "Ανέβασε εικόνα"}
					</span>

					<input
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
						disabled={uploading}
						onChange={(event) => {
							const file = event.target.files?.[0];

							if (file) {
								void uploadFile(file);
							}

							event.target.value = "";
						}}
					/>
				</label>

				<p>JPG, PNG, WebP, GIF ή AVIF.</p>
			</div>

			{message && (
				<div className="notice success">{message}</div>
			)}

			{files.length === 0 ? (
				<div className="form-card">
					<p>Δεν υπάρχουν εικόνες στο Media Library.</p>
				</div>
			) : (
				<div className="media-grid">
					{files.map((file) => (
						<article className="media-card" key={file.name}>
							<div className="media-preview">
								<Image
									src={file.url}
									alt={file.name}
									width={700}
									height={438}
								/>
							</div>

							<div className="media-card-body">
								<strong title={file.name}>
									{file.name}
								</strong>

								{file.size !== null && (
									<span>
										{Math.round(file.size / 1024)} KB
									</span>
								)}

								<div className="media-actions">
									<button
										className="button secondary"
										type="button"
										onClick={() => void copyUrl(file.url)}
									>
										Copy URL
									</button>

									<button
										className="button danger"
										type="button"
										onClick={() => void deleteFile(file.name)}
									>
										Διαγραφή
									</button>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}
