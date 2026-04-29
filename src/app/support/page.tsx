import Link from "next/link";
import { FooterPageShell } from "@/components/footer-page-shell";

export default function SupportPage() {
	return (
		<FooterPageShell
			title="Support"
			eyebrow="Help Center"
			description="Support resources for procurement teams and vendors using VendorFlow."
		>
			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Getting Help</h2>
				<p className="leading-7 text-[#555]">
					If you need help with onboarding, vendor linking, order workflows, or payment
					tracking, reach out to the VendorFlow support team at{" "}
					<a className="font-semibold text-[#1b3a5c] hover:underline" href="mailto:7265oixy@gmail.com">
						7265oixy@gmail.com
					</a>
					.
				</p>
			</section>

			<section className="grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl bg-[#f8f7f4] p-5">
					<h3 className="text-lg font-bold text-[#0f1f35]">Business Accounts</h3>
					<p className="mt-2 leading-7 text-[#555]">
						Help with vendor onboarding, dashboard activity, reports, and payment tracking.
					</p>
				</div>
				<div className="rounded-2xl bg-[#f8f7f4] p-5">
					<h3 className="text-lg font-bold text-[#0f1f35]">Vendor Accounts</h3>
					<p className="mt-2 leading-7 text-[#555]">
						Assistance with linked profiles, order responses, invoice uploads, and payment
						confirmations.
					</p>
				</div>
				<div className="rounded-2xl bg-[#f8f7f4] p-5">
					<h3 className="text-lg font-bold text-[#0f1f35]">Response Time</h3>
					<p className="mt-2 leading-7 text-[#555]">
						Most support requests receive a response within one business day.
					</p>
				</div>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Quick Links</h2>
				<div className="flex flex-wrap gap-4 text-sm font-medium">
					<Link href="/login" className="text-[#1b3a5c] hover:underline">
						Sign in
					</Link>
					<Link href="/register" className="text-[#1b3a5c] hover:underline">
						Create an account
					</Link>
					<Link href="/contact" className="text-[#1b3a5c] hover:underline">
						Contact sales
					</Link>
				</div>
			</section>
		</FooterPageShell>
	);
}
