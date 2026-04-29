import Link from "next/link";
import type { ReactNode } from "react";

type FooterPageShellProps = {
	title: string;
	eyebrow: string;
	description: string;
	children: ReactNode;
};

export function FooterPageShell({
	title,
	eyebrow,
	description,
	children,
}: FooterPageShellProps) {
	return (
		<div className="min-h-screen bg-[#f8f7f4] text-[#0f1f35]">
			<header className="border-b border-black/[0.06] bg-white/95 backdrop-blur-md">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
					<Link href="/" className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1b3a5c] text-sm font-bold text-white">
							VF
						</div>
						<span className="text-lg font-bold text-[#1b3a5c]">VendorFlow</span>
					</Link>
					<div className="flex items-center gap-5 text-sm font-medium text-[#555]">
						<Link href="/privacy" className="transition hover:text-[#1b3a5c]">
							Privacy
						</Link>
						<Link href="/terms" className="transition hover:text-[#1b3a5c]">
							Terms
						</Link>
						<Link href="/support" className="transition hover:text-[#1b3a5c]">
							Support
						</Link>
						<Link href="/contact" className="transition hover:text-[#1b3a5c]">
							Contact
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-16 md:py-20">
				<div className="max-w-3xl">
					<p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e07b39]">
						{eyebrow}
					</p>
					<h1 className="text-4xl font-extrabold leading-tight text-[#0f1f35] md:text-5xl">
						{title}
					</h1>
					<p className="mt-5 text-base leading-8 text-[#555] md:text-lg">
						{description}
					</p>
				</div>

				<div className="mt-12 space-y-8 rounded-3xl border border-black/[0.07] bg-white p-8 shadow-sm md:p-10">
					{children}
				</div>
			</main>
		</div>
	);
}
