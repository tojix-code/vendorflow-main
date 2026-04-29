import { FooterPageShell } from "@/components/footer-page-shell";

export default function TermsPage() {
	return (
		<FooterPageShell
			title="Terms of Service"
			eyebrow="Terms"
			description="These terms outline the responsibilities of organizations and vendors using VendorFlow to manage procurement workflows."
		>
			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Use of the Platform</h2>
				<p className="leading-7 text-[#555]">
					VendorFlow may be used only for lawful business operations. Users are responsible
					for keeping account credentials secure and for ensuring that records entered into the
					system are accurate and authorized.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Account Responsibility</h2>
				<p className="leading-7 text-[#555]">
					Each organization controls its own users, vendor records, orders, and payments.
					Administrators are responsible for reviewing access, permissions, and the accuracy
					of vendor-facing communications.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Availability and Changes</h2>
				<p className="leading-7 text-[#555]">
					We may update features, policies, or workflows over time to improve security and
					product quality. Planned maintenance or service interruptions may occur when needed
					to keep the platform stable.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Termination</h2>
				<p className="leading-7 text-[#555]">
					Accounts may be suspended or removed for misuse, unauthorized access attempts, or
					violations of these terms. Organizations remain responsible for any activity
					performed under their accounts.
				</p>
			</section>
		</FooterPageShell>
	);
}
