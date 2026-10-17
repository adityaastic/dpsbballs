import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/authGuard";
import {
  getTechnicalSeoConfig,
  saveTechnicalSeoConfig,
  RedirectRule,
  TechnicalSeoConfig,
} from "@/lib/seoCms";

export const dynamic = "force-dynamic";

function validateRedirects(redirects: RedirectRule[]): {
  cleaned: RedirectRule[];
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const cleaned: RedirectRule[] = [];
  const map = new Map<string, string>();

  for (const r of redirects) {
    const source = (r.sourcePath || "").trim();
    const target = (r.destinationUrl || "").trim();
    if (!source || !target) continue;

    const normSource = source.startsWith("/") ? source : `/${source}`;
    const normTarget =
      target.startsWith("http") || target.startsWith("/") ? target : `/${target}`;

    if (normSource === normTarget) {
      errors.push(
        `Direct redirect loop detected: "${normSource}" points to itself.`
      );
      continue;
    }

    if (normSource.startsWith("/admin") || normSource.startsWith("/api")) {
      errors.push(
        `Protected path "${normSource}" cannot be redirected because it would break the admin panel or API.`
      );
      continue;
    }

    map.set(normSource, normTarget);
    cleaned.push({
      ...r,
      sourcePath: normSource,
      destinationUrl: normTarget,
      type: r.type === 302 ? 302 : 301,
      active: r.active !== false,
    });
  }

  // Detect multi-hop chains and loops
  for (const r of cleaned) {
    if (!r.active) continue;
    const visited = new Set<string>([r.sourcePath]);
    let curr = r.destinationUrl;
    let hops = 1;

    while (map.has(curr)) {
      if (visited.has(curr)) {
        errors.push(
          `Circular redirect loop detected starting at "${r.sourcePath}" -> "${curr}".`
        );
        break;
      }
      visited.add(curr);
      curr = map.get(curr)!;
      hops++;
      if (hops > 5) break;
    }

    if (hops > 1 && !errors.length) {
      warnings.push(
        `Redirect chain (${hops} hops) detected for "${r.sourcePath}". Consider pointing directly to "${curr}".`
      );
    }
  }

  return { cleaned, warnings, errors };
}

export async function GET() {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const config = await getTechnicalSeoConfig();
    return NextResponse.json(config);
  } catch (err) {
    console.error("[GET /api/admin/seo/technical]", err);
    return NextResponse.json(
      { error: "Failed to load technical SEO settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { response } = await requireAuth("editor");
  if (response) return response;

  try {
    const body = (await request.json()) as Partial<TechnicalSeoConfig>;
    const existing = await getTechnicalSeoConfig();

    let redirects = existing.redirects;
    let redirectWarnings: string[] = [];

    if (Array.isArray(body.redirects)) {
      const validation = validateRedirects(body.redirects);
      if (validation.errors.length > 0) {
        return NextResponse.json(
          {
            error: validation.errors[0],
            errors: validation.errors,
            warnings: validation.warnings,
          },
          { status: 400 }
        );
      }
      redirects = validation.cleaned;
      redirectWarnings = validation.warnings;
    }

    const updated: TechnicalSeoConfig = {
      ...existing,
      ...body,
      redirects,
      robotsTxt: body.robotsTxt
        ? { ...existing.robotsTxt, ...body.robotsTxt }
        : existing.robotsTxt,
      sitemapConfig: body.sitemapConfig
        ? { ...existing.sitemapConfig, ...body.sitemapConfig }
        : existing.sitemapConfig,
      templates: body.templates
        ? { ...existing.templates, ...body.templates }
        : existing.templates,
      schemaConfig: body.schemaConfig
        ? { ...existing.schemaConfig, ...body.schemaConfig }
        : existing.schemaConfig,
      integrations: body.integrations
        ? { ...existing.integrations, ...body.integrations }
        : existing.integrations,
    };

    const ok = await saveTechnicalSeoConfig(updated);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to persist technical SEO settings to database" },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");

    return NextResponse.json({
      success: true,
      config: updated,
      warnings: redirectWarnings,
    });
  } catch (err) {
    console.error("[PUT /api/admin/seo/technical]", err);
    return NextResponse.json(
      { error: "Failed to update technical SEO configuration" },
      { status: 500 }
    );
  }
}
