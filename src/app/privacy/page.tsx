import { FooterPageShell } from "@/components/footer-page-shell";

export default function PrivacyPage() {
	return (
		<FooterPageShell
			title="Privacy Policy"
			eyebrow="Privacy"
			description="This page explains what information VendorFlow collects, how it is used, and the controls available to businesses and vendors using the platform."
		>
			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Information We Collect</h2>
				<p className="leading-7 text-[#555]">
					VendorFlow stores account details, vendor records, purchase orders, payment
					entries, and activity data required to operate the product. This may include names,
					email addresses, phone numbers, billing references, and order-related documents.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">How We Use Information</h2>
				<p className="leading-7 text-[#555]">
					We use account and workflow data to authenticate users, connect vendors with
					businesses, process orders and payments, send notifications, and improve product
					reliability and support.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Data Sharing</h2>
				<p className="leading-7 text-[#555]">
					Data is shared only with the organizations and vendor accounts involved in a given
					workflow, along with service providers needed to host, secure, and maintain the
					platform. VendorFlow does not sell user data.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Retention and Security</h2>
				<p className="leading-7 text-[#555]">
					Records are retained for operational, legal, and audit purposes. Access controls,
					authentication, and infrastructure safeguards are used to protect account and
					transaction data.
				</p>
			</section>
		</FooterPageShell>
	);
}
