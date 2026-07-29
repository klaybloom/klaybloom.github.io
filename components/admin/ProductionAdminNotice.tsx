import Link from "next/link";

export function ProductionAdminNotice() {
  return (
    <main
      data-tahoe-preview
      className="tahoe-shell min-h-screen flex items-center justify-center p-5"
    >
      <div className="tahoe-bg-fixed" aria-hidden />
      <section className="relative z-10 w-full max-w-lg tahoe-system-card !p-8 space-y-5 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: "var(--tahoe-accent-soft)", color: "var(--tahoe-accent)" }}
          aria-hidden
        >
          🖥️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: "var(--tahoe-text)" }}>
            内容管理仅限本地使用
          </h1>
          <p className="text-sm leading-6" style={{ color: "var(--tahoe-muted)" }}>
            线上页面不会读取或修改仓库内容。请在项目目录执行{" "}
            <code className="rounded px-1.5 py-0.5" style={{ background: "var(--tahoe-reader)" }}>
              npm run dev
            </code>
            ，再访问本机的 /admin/。
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/" className="tahoe-button tahoe-button-primary px-5 py-2 text-sm font-semibold">
            返回主页
          </Link>
        </div>
      </section>
    </main>
  );
}
