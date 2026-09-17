"use client";

import { useEffect } from "react";
export function ViewCounter({ slug }: { slug: string }) {
	useEffect(() => {
		fetch("/api/views", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ slug }),
			credentials: "same-origin",
			keepalive: true,
		}).catch(() => {});
	}, [slug]);
	return null;
}
