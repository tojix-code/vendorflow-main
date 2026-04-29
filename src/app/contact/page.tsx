import { FooterPageShell } from "@/components/footer-page-shell";

export default function ContactPage() {
	return (
		<FooterPageShell
			title="Contact Us"
			eyebrow="Contact"
			description="Talk to the VendorFlow team about onboarding, pricing, partnerships, or implementation support."
		>
			<section className="grid gap-4 md:grid-cols-2">
				<div className="rounded-2xl bg-[#f8f7f4] p-6">
					<h2 className="text-2xl font-bold text-[#1b3a5c]">Sales</h2>
					<p className="mt-3 leading-7 text-[#555]">
						Questions about procurement workflows, team rollout, or plans for growing
						organizations.
					</p>
					<a className="mt-4 inline-block font-semibold text-[#1b3a5c] hover:underline" href="mailto:7265oixy@gmail.com">
						7265oixy@gmail.com
					</a>
				</div>
				<div className="rounded-2xl bg-[#f8f7f4] p-6">
					<h2 className="text-2xl font-bold text-[#1b3a5c]">General Inquiries</h2>
					<p className="mt-3 leading-7 text-[#555]">
						Reach out for partnerships, implementation questions, or anything that does not
						fit a support ticket.
					</p>
					<a className="mt-4 inline-block font-semibold text-[#1b3a5c] hover:underline" href="mailto:7265oixy@gmail.com">
						7265oixy@gmail.com
					</a>
				</div>
			</section>

			<section className="space-y-3">
				<h2 className="text-2xl font-bold text-[#1b3a5c]">Office Hours</h2>
				<p className="leading-7 text-[#555]">
					Monday to Friday, 9:00 AM to 6:00 PM IST. Messages received outside these hours are
					reviewed on the next business day.
				</p>
			</section>
		</FooterPageShell>
	);
}
