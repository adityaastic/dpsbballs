"use client";

import React, { useEffect, useState } from "react";
import { RedirectRule, TechnicalSeoConfig } from "@/lib/seoCms";

export default function TechnicalSeoControlCenterPage() {
  const [config, setConfig] = useState<TechnicalSeoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    | "redirects"
    | "robots"
    | "sitemap"
    | "templates"
    | "schema"
    | "integrations"
  >("redirects");

  // New redirect form state
  const [newSource, setNewSource] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newType, setNewType] = useState<301 | 302>(301);
  const [newNote, setNewNote] = useState("");

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/technical");
      if (res.ok) {
        setConfig(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (
        t &&
        [
          "redirects",
          "robots",
          "sitemap",
          "templates",
          "schema",
          "integrations",
        ].includes(t)
      ) {
        setActiveTab(t as any);
      }
    }
  }, []);

  const handleSave = async (nextConfig?: TechnicalSeoConfig) => {
    const payload = nextConfig || config;
    if (!payload) return;

    setSaving(true);
    setMessage("");
    setErrorMsg("");
    setWarnings([]);

    try {
      const res = await fetch("/api/admin/seo/technical", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save technical SEO settings");
        if (Array.isArray(data.warnings)) setWarnings(data.warnings);
        return;
      }
      setConfig(data.config);
      if (Array.isArray(data.warnings)) setWarnings(data.warnings);
      setMessage(
        "Technical SEO configuration saved and live Next.js routes revalidated!"
      );
    } catch {
      setErrorMsg("Network error while saving technical SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRedirect = async () => {
    if (!config || !newSource.trim() || !newDest.trim()) return;
    const rule: RedirectRule = {
      id: `redir-${Date.now()}`,
      sourcePath: newSource.trim().startsWith("/")
        ? newSource.trim()
        : `/${newSource.trim()}`,
      destinationUrl: newDest.trim(),
      type: newType,
      active: true,
      createdAt: new Date().toISOString(),
      note: newNote.trim() || "Manual redirect rule",
    };

    const nextConfig: TechnicalSeoConfig = {
      ...config,
      redirects: [rule, ...(config.redirects || [])],
    };
    setConfig(nextConfig);
    setNewSource("");
    setNewDest("");
    setNewNote("");
    await handleSave(nextConfig);
  };

  if (loading || !config) {
    return (
      <div className="p-8 text-slate-400">
        Loading Technical SEO Control Center...
      </div>
    );
  }

  const robotsPreview = [
    `User-agent: *`,
    config.robotsTxt.allowIndexing ? `Allow: /` : `Disallow: /`,
    `Disallow: /admin/`,
    `Disallow: /api/`,
    ...(config.robotsTxt.blockAiBots
      ? [
          ``,
          `User-agent: GPTBot`,
          `Disallow: /`,
          `User-agent: CCBot`,
          `Disallow: /`,
        ]
      : []),
    ...(config.robotsTxt.customRules
      ? [``, config.robotsTxt.customRules.trim()]
      : []),
    ``,
    `Sitemap: https://www.dspballs.co.in/sitemap.xml`,
  ].join("\n");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            🛠️ Technical SEO, Redirects, Sitemaps & Schema Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Directly manage 301/302 Redirects, Robots.txt rules, XML Sitemaps,
            SEO Title Templates, Global JSON-LD Schema, and Google Search
            Console integrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
          >
            View Live Sitemap.xml ↗
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
          >
            View Live Robots.txt ↗
          </a>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25"
          >
            {saving ? "Saving..." : "Save Technical SEO Settings"}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          ✓ {message}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium">
          ✕ {errorMsg}
        </div>
      )}
      {warnings.map((w, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium"
        >
          ⚠ {w}
        </div>
      ))}

      {/* Tab Selector */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {[
          {
            id: "redirects",
            label: `🔀 Redirect Manager (${config.redirects?.length || 0})`,
          },
          { id: "robots", label: "🤖 Robots.txt & Indexability" },
          { id: "sitemap", label: "🗺️ XML Sitemap Config" },
          { id: "templates", label: "📋 Dynamic Meta Templates" },
          { id: "schema", label: "🏢 Organization & JSON-LD Schema" },
          { id: "integrations", label: "🔍 Search Console & GA4" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Redirect Manager */}
      {activeTab === "redirects" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
          <div>
            <h2 className="text-base font-bold">
              301 & 302 Redirect Manager (Middleware Enforced)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All active redirects are enforced automatically on live requests
              and validated against circular loops and chains. Changing a
              published blog article slug also adds a 301 redirect here
              automatically.
            </p>
          </div>

          {/* Add New Redirect Form */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-[11px] uppercase text-slate-400 mb-1">
                Old Source Path
              </label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="/old-product-url"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-[11px] uppercase text-slate-400 mb-1">
                Destination Path or URL
              </label>
              <input
                type="text"
                value={newDest}
                onChange={(e) => setNewDest(e.target.value)}
                placeholder="/products/high-chrome-alloy-steel-balls"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase text-slate-400 mb-1">
                Redirect Type
              </label>
              <select
                value={newType}
                onChange={(e) =>
                  setNewType(Number(e.target.value) as 301 | 302)
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value={301}>301 Permanent</option>
                <option value={302}>302 Temporary</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase text-slate-400 mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Slug migration"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="button"
                onClick={handleAddRedirect}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Redirects Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[11px] uppercase text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Source URL</th>
                  <th className="py-3 px-4">Destination URL</th>
                  <th className="py-3 px-4">Note / Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {(config.redirects || []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={(e) => {
                          const next = config.redirects.map((item) =>
                            item.id === r.id
                              ? { ...item, active: e.target.checked }
                              : item
                          );
                          setConfig({ ...config, redirects: next });
                        }}
                        className="rounded border-slate-600 text-blue-600"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          r.type === 301
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      {r.sourcePath}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-400">
                      {r.destinationUrl}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {r.note || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const next = config.redirects.filter(
                            (item) => item.id !== r.id
                          );
                          setConfig({ ...config, redirects: next });
                        }}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(config.redirects || []).length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-slate-500"
                    >
                      No redirects configured yet. Add a 301 or 302 redirect
                      above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Robots.txt & Indexability */}
      {activeTab === "robots" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold">
              Robots.txt & Global Search Engine Visibility
            </h2>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.robotsTxt.allowIndexing}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    robotsTxt: {
                      ...config.robotsTxt,
                      allowIndexing: e.target.checked,
                    },
                  })
                }
                className="mt-1 rounded border-slate-600 text-blue-600"
              />
              <div>
                <div className="text-sm font-semibold text-white">
                  Allow Search Engines to Index Website (Production Mode)
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unchecking this outputs <code>Disallow: /</code> in robots.txt
                  and blocks search engines globally. Keep checked on live
                  production!
                </p>
              </div>
            </label>

            {!config.robotsTxt.allowIndexing && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                ⚠ CRITICAL WARNING: Global search engine indexing is currently
                DISABLED. Google will not crawl your website!
              </div>
            )}

            <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.robotsTxt.blockAiBots}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    robotsTxt: {
                      ...config.robotsTxt,
                      blockAiBots: e.target.checked,
                    },
                  })
                }
                className="mt-1 rounded border-slate-600 text-blue-600"
              />
              <div>
                <div className="text-sm font-semibold text-white">
                  Block AI Training Scrapers (GPTBot & CCBot)
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prevents third-party AI training crawlers while keeping
                  Googlebot and Bingbot fully allowed.
                </p>
              </div>
            </label>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Additional Custom Robots.txt Directives
              </label>
              <textarea
                rows={4}
                value={config.robotsTxt.customRules || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    robotsTxt: {
                      ...config.robotsTxt,
                      customRules: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Disallow: /private-downloads/"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Live /robots.txt Output Preview
            </h3>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
              {robotsPreview}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: XML Sitemap Config */}
      {activeTab === "sitemap" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <h2 className="text-base font-bold">
            Dynamic XML Sitemap Configuration (/sitemap.xml)
          </h2>
          <p className="text-xs text-slate-400">
            Select which content types are included in the dynamic XML sitemap.
            Any page or article marked <code>noindex</code> or saved as a{" "}
            <code>Draft</code> is automatically excluded from the sitemap.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              {
                key: "includePages",
                title: "Core Corporate Pages",
                desc: "Home, About, Quality, Technical, Clients, Global Network, Contact",
              },
              {
                key: "includeProducts",
                title: "Industrial Product Pages",
                desc: "All active precision ball & media product specification pages",
              },
              {
                key: "includeBlogs",
                title: "Published Blog Articles",
                desc: "All published technical guides & /blog archive index",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(config.sitemapConfig as any)[item.key] !== false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sitemapConfig: {
                        ...config.sitemapConfig,
                        [item.key]: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 rounded border-slate-600 text-blue-600"
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Dynamic Meta Templates */}
      {activeTab === "templates" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-5">
          <div>
            <h2 className="text-base font-bold">
              Dynamic SEO Title & Meta Description Templates
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Supported variables: <code>%title%</code>, <code>%sep%</code>,{" "}
              <code>%site_name%</code>, <code>%category%</code>,{" "}
              <code>%excerpt%</code>. Custom per-page or per-article SEO fields
              always take priority over templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Title Separator (<code>%sep%</code>)
              </label>
              <input
                type="text"
                value={config.templates.titleSeparator}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    templates: {
                      ...config.templates,
                      titleSeparator: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Page Title Template
              </label>
              <input
                type="text"
                value={config.templates.pageTitleTemplate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    templates: {
                      ...config.templates,
                      pageTitleTemplate: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Product Title Template
              </label>
              <input
                type="text"
                value={config.templates.productTitleTemplate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    templates: {
                      ...config.templates,
                      productTitleTemplate: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Blog Article Title Template
              </label>
              <input
                type="text"
                value={config.templates.blogTitleTemplate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    templates: {
                      ...config.templates,
                      blogTitleTemplate: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Global Organization & JSON-LD Schema */}
      {activeTab === "schema" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-5">
          <div>
            <h2 className="text-base font-bold">
              Global Schema.org Structured Data (Organization &
              ManufacturingBusiness)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rendered as server-side JSON-LD across the website to power Google
              Knowledge Graph and rich results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={config.schemaConfig.organizationName}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    schemaConfig: {
                      ...config.schemaConfig,
                      organizationName: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={config.schemaConfig.legalName}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    schemaConfig: {
                      ...config.schemaConfig,
                      legalName: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Customer Service Phone
              </label>
              <input
                type="text"
                value={config.schemaConfig.customerServicePhone}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    schemaConfig: {
                      ...config.schemaConfig,
                      customerServicePhone: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Customer Service Email
              </label>
              <input
                type="text"
                value={config.schemaConfig.customerServiceEmail}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    schemaConfig: {
                      ...config.schemaConfig,
                      customerServiceEmail: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Google Search Console & GA4 Integrations */}
      {activeTab === "integrations" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-5">
          <div>
            <h2 className="text-base font-bold">
              Google Search Console, Verification & Analytics Integrations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect Google Search Console to pull real query clicks,
              impressions, CTR, and average position into the SEO Dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Google Site Verification Code (meta tag content)
              </label>
              <input
                type="text"
                value={config.integrations.googleSiteVerification}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    integrations: {
                      ...config.integrations,
                      googleSiteVerification: e.target.value,
                    },
                  })
                }
                placeholder="e.g. google-site-verification token"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                value={config.integrations.ga4MeasurementId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    integrations: {
                      ...config.integrations,
                      ga4MeasurementId: e.target.value,
                    },
                  })
                }
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                GSC Property URL
              </label>
              <input
                type="text"
                value={config.integrations.gscPropertyUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    integrations: {
                      ...config.integrations,
                      gscPropertyUrl: e.target.value,
                    },
                  })
                }
                placeholder="https://www.dspballs.co.in/"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Google Search Console OAuth Access Token (Optional for Live API)
              </label>
              <input
                type="password"
                value={config.integrations.gscAccessToken}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    integrations: {
                      ...config.integrations,
                      gscAccessToken: e.target.value,
                      gscConnected: Boolean(e.target.value.trim()),
                    },
                  })
                }
                placeholder="ya29.a0AfH6SM..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
