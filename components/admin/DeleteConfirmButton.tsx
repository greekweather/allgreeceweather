"use client";

import { useState } from "react";

export function DeleteConfirmButton({
	id,
	name,
	action,
	itemType,
}: {
	id: string;
	name: string;
	action: (formData: FormData) => void;
	itemType: "άρθρο" | "ετικέτα";
}) {
	const [showConfirm, setShowConfirm] = useState(false);

	return (
		<>
			<button
				className="button danger"
				type="button"
				onClick={() => setShowConfirm(true)}
			>
				Διαγραφή
			</button>

			{showConfirm && (
				<div className="delete-confirm-overlay">
					<div
						className="delete-confirm-dialog"
						role="dialog"
						aria-modal="true"
						aria-labelledby="delete-confirm-title"
					>
						<h2 id="delete-confirm-title">Διαγραφή {itemType}</h2>

						<p>
							Είσαι σίγουρος ότι θέλεις να διαγράψεις το {itemType}{" "}
							<strong>«{name}»</strong>;
						</p>

						<p className="delete-confirm-warning">
							Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
						</p>

						<div className="form-actions">
							<button
								className="button secondary"
								type="button"
								onClick={() => setShowConfirm(false)}
							>
								Ακύρωση
							</button>

							<form action={action}>
								<input type="hidden" name="id" value={id} />
								<button className="button danger" type="submit">
									Ναι, διαγραφή
								</button>
							</form>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
