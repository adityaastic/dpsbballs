import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env
const envPath = path.resolve("./.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "media";

console.log("=== CONFIGURATION CHECK ===");
console.log("Supabase URL:", supabaseUrl ? "✅ Found (" + supabaseUrl + ")" : "❌ Missing");
console.log("Anon Key:", anonKey ? "✅ Found (Length: " + anonKey.length + ")" : "❌ Missing");
console.log("Service Role Key:", serviceKey ? "✅ Found (Length: " + serviceKey.length + ")" : "❌ Missing");
console.log("Bucket Name:", bucketName);

if (!supabaseUrl || !anonKey) {
  console.error("Missing required Supabase configuration!");
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, anonKey);
const adminClient = serviceKey ? createClient(supabaseUrl, serviceKey) : null;

async function runTests() {
  console.log("\n=== 1. TESTING SUPABASE TABLES & RLS ===");
  const tables = ["products", "site_settings", "pages", "enquiries", "admins", "media"];

  for (const table of tables) {
    try {
      // Test with anon client first
      const { error: anonErr, count: anonCount } = await anonClient
        .from(table)
        .select("*", { count: "exact", head: true });

      if (anonErr) {
        if (adminClient) {
          const { error: adminErr, count: adminCount } = await adminClient
            .from(table)
            .select("*", { count: "exact", head: true });

          if (adminErr) {
            console.log(`❌ Table '${table}': Error - ${adminErr.message} (Code: ${adminErr.code})`);
          } else {
            console.log(`✅ Table '${table}': Accessible via Service Role (Count: ${adminCount ?? 0}) | Note: Anon blocked as expected by RLS`);
          }
        } else {
          console.log(`❌ Table '${table}': Anon Error - ${anonErr.message}`);
        }
      } else {
        console.log(`✅ Table '${table}': Accessible via Public/Anon (Count: ${anonCount ?? 0})`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}': Exception - ${e.message}`);
    }
  }

  console.log("\n=== 2. TESTING SUPABASE STORAGE BUCKET ===");
  if (adminClient) {
    try {
      const { data: buckets, error: bErr } = await adminClient.storage.listBuckets();
      if (bErr) {
        console.log("❌ Storage Buckets Error:", bErr.message);
      } else {
        console.log("✅ Storage Buckets found:", buckets.map((b) => b.name).join(", ") || "(none)");
        const hasBucket = buckets.some((b) => b.name === bucketName);
        if (hasBucket) {
          console.log(`✅ Target bucket '${bucketName}' exists and is ready!`);
        } else {
          console.log(`⚠️ Target bucket '${bucketName}' not found in bucket list.`);
        }
      }
    } catch (e) {
      console.log("❌ Storage Exception:", e.message);
    }
  }

  console.log("\n=== 3. TESTING DATABASE DATA INTEGRITY ===");
  try {
    const { data: prods, error: prodErr } = await (adminClient || anonClient)
      .from("products")
      .select("id, title, slug, published")
      .limit(5);

    if (prodErr) {
      console.log("❌ Fetch products error:", prodErr.message);
    } else {
      console.log(`✅ Fetched ${prods?.length || 0} sample products:`);
      prods?.forEach((p) => console.log(`   - [${p.slug}] ${p.title} (Published: ${p.published})`));
    }
  } catch (e) {
    console.log("❌ Product query exception:", e.message);
  }

  try {
    const { data: settings, error: setErr } = await (adminClient || anonClient)
      .from("site_settings")
      .select("name, short_name, email, phone_work")
      .limit(1);

    if (setErr) {
      console.log("❌ Fetch site_settings error:", setErr.message);
    } else {
      console.log("✅ Site settings retrieved:", settings?.[0] || "(empty)");
    }
  } catch (e) {
    console.log("❌ Site settings exception:", e.message);
  }

  console.log("\n=== 4. TESTING ADMIN ACCOUNT EXISTENCE ===");
  if (adminClient) {
    try {
      const { data: admins, error: adminErr } = await adminClient
        .from("admins")
        .select("id, username, email, role");
      if (adminErr) {
        console.log("❌ Admin query error:", adminErr.message);
      } else {
        console.log(`✅ Admin accounts found (${admins?.length || 0}):`, admins?.map(a => `${a.username} (${a.email}, role: ${a.role})`));
      }
    } catch (e) {
      console.log("❌ Admin query exception:", e.message);
    }
  }

  console.log("\n=== TEST RUN FINISHED ===");
}

runTests();
