import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
	const navLinks = [
		{ label: "How it works", href: "#how" },
		{ label: "Features", href: "#features" },
		{ label: "Pricing", href: "#cta" },
	];

	const footerLinks = ["Privacy", "Terms", "Support", "Contact"];

	return (
		<div className="min-h-screen bg-white font-sans">

			{/* ── NAV ── */}
			<nav className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link href="/" className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1b3a5c] text-sm font-bold text-white">
							VF
						</div>
						<span className="text-lg font-bold text-[#1b3a5c]">VendorFlow</span>
					</Link>
					<ul className="hidden items-center gap-8 md:flex">
						{navLinks.map((item) => (
							<li key={item.label}>
								<a href={item.href} className="text-sm font-medium text-[#555] transition hover:text-[#1b3a5c]">
									{item.label}
								</a>
							</li>
						))}
					</ul>
					<div className="flex items-center gap-2.5">
						<Button asChild size="sm" variant="outline" className="border-black/10 text-[#1b3a5c]">
							<Link href="/login">Log in</Link>
						</Button>
						<Button asChild size="sm" className="bg-[#1b3a5c] text-white hover:bg-[#2a5580]">
							<Link href="/register">Start free</Link>
						</Button>
					</div>
				</div>
			</nav>

			{/* ── HERO ── */}
			<section className="relative overflow-hidden bg-[#f8f7f4]">
				{/* background grid */}
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(27,58,92,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(27,58,92,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

				<div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
					<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">

						{/* LEFT */}
						<div className="max-w-xl">
							<div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#1b3a5c]/8 px-4 py-1.5 text-xs font-semibold text-[#1b3a5c]">
								<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e07b39]" />
								Trusted by 5,000+ procurement teams
							</div>

							<h1 className="mb-6 text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-[#0f1f35] md:text-[4rem]">
								One platform.<br />
								<span className="text-[#e07b39]">All your vendors.</span>
							</h1>

							<p className="mb-8 text-lg leading-relaxed text-[#555]">
								Stop managing vendors through spreadsheets and emails. VendorFlow gives you a command centre for vendor profiles, purchase orders, payments, and performance — in real time.
							</p>

							<div className="flex flex-wrap gap-3">
								<Button asChild size="lg" className="bg-[#1b3a5c] px-8 text-white hover:bg-[#2a5580]">
									<Link href="/register">Get started free</Link>
								</Button>
								<Button asChild size="lg" variant="outline" className="border-black/15 px-8 text-[#1b3a5c]">
									<a href="#how">See how it works →</a>
								</Button>
							</div>

							<div className="mt-10 flex flex-wrap gap-6 text-sm text-[#777]">
								{["No credit card required", "Setup in 5 minutes", "Free for small teams"].map((t) => (
									<span key={t} className="flex items-center gap-1.5">
										<span className="text-green-500">✓</span> {t}
									</span>
								))}
							</div>
						</div>

						{/* RIGHT — Dashboard preview */}
						<div className="relative lg:pl-8">
							<div className="rounded-2xl border border-black/[0.08] bg-white shadow-2xl shadow-[#1b3a5c]/10">
								{/* Window chrome */}
								<div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-3.5">
									<span className="h-3 w-3 rounded-full bg-red-400" />
									<span className="h-3 w-3 rounded-full bg-yellow-400" />
									<span className="h-3 w-3 rounded-full bg-green-400" />
									<span className="ml-4 rounded-md bg-[#f0ede8] px-3 py-1 text-[11px] text-[#888]">vendorflow.app/business/dashboard</span>
								</div>

								{/* Dashboard content */}
								<div className="p-5">
									{/* Header */}
									<div className="mb-5 flex items-center justify-between">
										<div>
											<p className="text-sm font-bold text-[#0f1f35]">Good morning, Rajesh 👋</p>
											<p className="text-xs text-[#888]">Here's your vendor overview for today</p>
										</div>
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b3a5c] text-xs font-bold text-white">R</div>
									</div>

									{/* Stat cards */}
									<div className="mb-5 grid grid-cols-3 gap-3">
										{[
											{ label: "Active Vendors", value: "24", delta: "+2 this week", color: "text-[#1b3a5c]", bg: "bg-blue-50" },
											{ label: "Open Orders", value: "18", delta: "6 due today", color: "text-purple-700", bg: "bg-purple-50" },
											{ label: "Pending Dues", value: "₹3.2L", delta: "7 vendors", color: "text-[#e07b39]", bg: "bg-orange-50" },
										].map((s) => (
											<div key={s.label} className={`rounded-xl ${s.bg} p-3`}>
												<p className="text-[10px] font-medium text-[#666]">{s.label}</p>
												<p className={`mt-1 text-xl font-extrabold ${s.color}`}>{s.value}</p>
												<p className="mt-0.5 text-[9px] text-[#888]">{s.delta}</p>
											</div>
										))}
									</div>

									{/* Recent orders */}
									<p className="mb-2.5 text-xs font-bold text-[#0f1f35]">Recent Orders</p>
									<div className="space-y-2">
										{[
											{ ref: "ORD-4821", vendor: "Sunrise Supplies", amount: "₹45,000", status: "In Progress", statusBg: "bg-purple-100 text-purple-700" },
											{ ref: "ORD-4820", vendor: "TechLink Pvt Ltd", amount: "₹1,20,000", status: "Delivered", statusBg: "bg-green-100 text-green-700" },
											{ ref: "ORD-4819", vendor: "Metro Logistics", amount: "₹18,500", status: "Pending", statusBg: "bg-yellow-100 text-yellow-700" },
										].map((o) => (
											<div key={o.ref} className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-3 py-2">
												<div>
													<p className="text-[11px] font-semibold text-[#0f1f35]">{o.ref}</p>
													<p className="text-[10px] text-[#888]">{o.vendor}</p>
												</div>
												<div className="flex items-center gap-2">
													<p className="text-[11px] font-bold text-[#1b3a5c]">{o.amount}</p>
													<span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${o.statusBg}`}>{o.status}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Floating notification */}
							<div className="absolute -right-3 top-16 z-10 w-52 rounded-xl border border-black/[0.07] bg-white p-3 shadow-lg">
								<div className="flex items-start gap-2">
									<div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">✓</div>
									<div>
										<p className="text-[11px] font-semibold text-[#0f1f35]">Payment Confirmed</p>
										<p className="text-[10px] text-[#888]">Sunrise Supplies · INV-234 · ₹45,000</p>
										<p className="mt-1 text-[9px] text-[#aaa]">2 minutes ago</p>
									</div>
								</div>
							</div>

							{/* Floating vendor badge */}
							<div className="absolute -left-3 bottom-12 z-10 flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 shadow-lg">
								<div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1b3a5c] text-[10px] font-bold text-white">SS</div>
								<div>
									<p className="text-[10px] font-semibold text-[#0f1f35]">Vendor accepted order</p>
									<p className="text-[9px] text-[#888]">ORD-4822 · Metro Logistics</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── LOGOS / SOCIAL PROOF ── */}
			<div className="border-y border-black/[0.06] bg-white py-8">
				<div className="mx-auto max-w-7xl px-6">
					<p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[#aaa]">
						Trusted by procurement teams at
					</p>
					<div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
						{["Astra Mfg.", "TriVox Retail", "Nexon Logistics", "BluePeak Ltd", "CoreBuild Inc.", "Summit Trade"].map((name) => (
							<span key={name} className="text-base font-bold text-[#ccc] transition hover:text-[#999]">
								{name}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* ── HOW IT WORKS ── */}
			<section className="mx-auto max-w-7xl px-6 py-24" id="how">
				<div className="mb-14 text-center">
					<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#e07b39]">How it works</p>
					<h2 className="text-4xl font-extrabold text-[#0f1f35]">From onboarding to payment in 4 steps</h2>
					<p className="mx-auto mt-4 max-w-lg text-base text-[#666]">VendorFlow replaces the chaos of spreadsheets, emails, and manual tracking with a single streamlined workflow.</p>
				</div>

				<div className="relative grid grid-cols-1 gap-0 md:grid-cols-4">
					{/* connector line */}
					<div className="absolute top-10 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-[#1b3a5c]/20 to-transparent md:block" />

					{[
						{ num: "1", icon: "🏢", title: "Register & set up", desc: "Create your business account. Add your company details and invite your team." },
						{ num: "2", icon: "🤝", title: "Onboard vendors", desc: "Add vendor profiles with contact info, services, and payment terms. Vendors register their own account to collaborate." },
						{ num: "3", icon: "📦", title: "Place & track orders", desc: "Create purchase orders with line items, assign to vendors, set due dates. Vendors accept and update status." },
						{ num: "4", icon: "💳", title: "Pay & analyse", desc: "Record payments, vendors upload invoices. View reports on delivery rates, payment health, and vendor performance." },
					].map((s) => (
						<div key={s.num} className="relative flex flex-col items-center px-6 text-center">
							<div className="relative z-10 mb-5 flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 border-[#1b3a5c]/15 bg-white text-3xl shadow-md shadow-[#1b3a5c]/08">
								{s.icon}
								<span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1b3a5c] text-[10px] font-bold text-white">{s.num}</span>
							</div>
							<h3 className="mb-2 text-sm font-bold text-[#0f1f35]">{s.title}</h3>
							<p className="text-sm leading-relaxed text-[#666]">{s.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── FEATURES ── */}
			<section className="bg-[#f8f7f4] py-24" id="features">
				<div className="mx-auto max-w-7xl px-6">
					<div className="mb-14 text-center">
						<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#e07b39]">Features</p>
						<h2 className="text-4xl font-extrabold text-[#0f1f35]">Built for serious procurement</h2>
						<p className="mx-auto mt-4 max-w-lg text-base text-[#666]">Every feature is designed around the real pain points of managing multiple vendors at scale.</p>
					</div>

					<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: "👥",
								title: "Centralised Vendor Profiles",
								desc: "One place for all vendor details — contact, services, payment terms, and activity status. Search, filter, and manage with ease.",
								tag: "Vendor Management",
								tagColor: "bg-blue-100 text-blue-700",
							},
							{
								icon: "📋",
								title: "Itemised Purchase Orders",
								desc: "Create orders with multiple line items, quantities, and unit prices. Auto-calculates totals. Assign to any vendor instantly.",
								tag: "Order Management",
								tagColor: "bg-purple-100 text-purple-700",
							},
							{
								icon: "🔄",
								title: "Two-Way Order Workflow",
								desc: "Vendors can accept or reject orders with a reason. Update status from Accepted → In Progress → Delivered. Business is notified instantly.",
								tag: "Collaboration",
								tagColor: "bg-teal-100 text-teal-700",
							},
							{
								icon: "🧾",
								title: "Invoice & Payment Tracking",
								desc: "Record payments with method, amount, and remarks. Vendors upload invoices as files. Confirm or flag payment status at every stage.",
								tag: "Payments",
								tagColor: "bg-orange-100 text-orange-700",
							},
							{
								icon: "📊",
								title: "Analytics & Reports",
								desc: "Visual charts for order volumes, vendor delivery rates, payment trends, and completion metrics. Export and compare by vendor or date.",
								tag: "Reports",
								tagColor: "bg-green-100 text-green-700",
							},
							{
								icon: "🔔",
								title: "Real-time Notifications",
								desc: "Both business and vendor get notified on order creation, status changes, payment confirmations, and rejections — no lag, no missed updates.",
								tag: "Notifications",
								tagColor: "bg-pink-100 text-pink-700",
							},
						].map((f) => (
							<div key={f.title} className="group rounded-2xl border border-black/[0.07] bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1b3a5c]/[0.07]">
								<div className="mb-4 flex items-start justify-between">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0ede8] text-2xl">{f.icon}</div>
									<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${f.tagColor}`}>{f.tag}</span>
								</div>
								<h3 className="mb-2 text-base font-bold text-[#0f1f35]">{f.title}</h3>
								<p className="text-sm leading-relaxed text-[#666]">{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── SPLIT: BUSINESS vs VENDOR ── */}
			<section className="mx-auto max-w-7xl px-6 py-24">
				<div className="mb-14 text-center">
					<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#e07b39]">Two roles, one platform</p>
					<h2 className="text-4xl font-extrabold text-[#0f1f35]">Designed for both sides of the deal</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* Business */}
					<div className="relative overflow-hidden rounded-3xl bg-[#1b3a5c] p-10 text-white">
						<div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/[0.04]" />
						<div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/[0.04]" />
						<div className="relative z-10">
							<span className="mb-5 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">For Business</span>
							<h3 className="mb-4 text-3xl font-extrabold">Take control of your supplier network</h3>
							<p className="mb-8 text-base leading-relaxed text-white/70">
								Manage every vendor, every order, every payment from a single dashboard. Get the visibility you need to make faster procurement decisions.
							</p>
							<ul className="mb-8 space-y-3">
								{[
									"Add unlimited vendors with full profiles",
									"Create purchase orders with itemised line items",
									"Track order status across all vendors",
									"Record payments and monitor dues",
									"Generate vendor performance reports",
									"Get notified on every order update",
								].map((item) => (
									<li key={item} className="flex items-center gap-3 text-sm text-white/85">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e07b39] text-[10px] font-bold">✓</span>
										{item}
									</li>
								))}
							</ul>
							<Button asChild size="lg" className="bg-white text-[#1b3a5c] hover:bg-white/90">
								<Link href="/register">Register as Business</Link>
							</Button>
						</div>
					</div>

					{/* Vendor */}
					<div className="relative overflow-hidden rounded-3xl border-2 border-[#e07b39]/20 bg-[#fff9f5] p-10">
						<div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#e07b39]/[0.05]" />
						<div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-[#e07b39]/[0.05]" />
						<div className="relative z-10">
							<span className="mb-5 inline-block rounded-full bg-[#e07b39]/10 px-3 py-1 text-xs font-semibold text-[#e07b39]">For Vendors</span>
							<h3 className="mb-4 text-3xl font-extrabold text-[#0f1f35]">Deliver faster, get paid sooner</h3>
							<p className="mb-8 text-base leading-relaxed text-[#666]">
								See every order assigned to you, update progress, upload invoices, and confirm payments — all from your vendor dashboard.
							</p>
							<ul className="mb-8 space-y-3">
								{[
									"View and accept incoming orders",
									"Update order status at each stage",
									"Upload invoices directly to payments",
									"Confirm payment clearances",
									"Track your order and payment history",
									"View your delivery performance metrics",
								].map((item) => (
									<li key={item} className="flex items-center gap-3 text-sm text-[#444]">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e07b39] text-[10px] font-bold text-white">✓</span>
										{item}
									</li>
								))}
							</ul>
							<Button asChild size="lg" className="bg-[#e07b39] text-white hover:bg-[#c96b2e]">
								<Link href="/register">Register as Vendor</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* ── METRICS ── */}
			<section className="bg-[#f8f7f4] py-20">
				<div className="mx-auto max-w-7xl px-6">
					<div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
						{[
							{ value: "5,000+", label: "Businesses using VendorFlow", color: "text-[#1b3a5c]" },
							{ value: "20,000+", label: "Vendor profiles managed", color: "text-[#1b3a5c]" },
							{ value: "₹50Cr+", label: "Payments tracked monthly", color: "text-[#e07b39]" },
							{ value: "94%", label: "On-time delivery rate", color: "text-green-600" },
						].map((m) => (
							<div key={m.label} className="rounded-2xl border border-black/[0.07] bg-white p-8">
								<p className={`text-4xl font-extrabold ${m.color}`}>{m.value}</p>
								<p className="mt-2 text-sm text-[#666]">{m.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section className="relative overflow-hidden bg-[#0f1f35] py-28 text-center" id="cta">
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
				<div className="relative z-10 mx-auto max-w-2xl px-6">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">
						🚀 &nbsp;Join 5,000+ businesses already streamlining procurement
					</div>
					<h2 className="mb-5 text-5xl font-extrabold leading-tight text-white">
						Stop managing vendors the hard way
					</h2>
					<p className="mb-10 text-lg leading-relaxed text-white/60">
						Replace your spreadsheets, email chains, and manual follow-ups with one powerful platform. Set up in minutes. Scale without limits.
					</p>
					<div className="flex flex-wrap justify-center gap-3.5">
						<Button asChild size="lg" className="bg-[#e07b39] px-10 text-white hover:bg-[#c96b2e]">
							<Link href="/register">Get started free</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent px-10 text-white hover:bg-white/[0.08]">
							<Link href="/login">Sign in</Link>
						</Button>
					</div>
					<p className="mt-6 text-sm text-white/40">No credit card required · Free forever for small teams</p>
				</div>
			</section>

			{/* ── FOOTER ── */}
			<footer className="bg-[#080f1a] px-6 py-12">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e07b39] text-xs font-bold text-white">VF</div>
						<span className="text-lg font-bold text-white">VendorFlow</span>
					</div>
					<div className="flex gap-6">
						{footerLinks.map((l) => (
							<a key={l} href="/" className="text-sm text-white/40 transition hover:text-white">
								{l}
							</a>
						))}
					</div>
					<p className="text-sm text-white/30">&copy; 2025 VendorFlow. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}