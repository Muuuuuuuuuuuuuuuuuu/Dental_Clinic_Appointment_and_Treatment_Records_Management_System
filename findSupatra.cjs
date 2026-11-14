const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envFile = fs.readFileSync("./.env.local", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const parts = trimmed.split("=");
  const key = parts[0].trim();
  const val = parts.slice(1).join("=").trim().replace(/^"|"$/g, "");
  env[key] = val;
});

const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function findSupatra() {
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error) {
    console.error("listUsers error:", error);
    return;
  }
  const found = data.users.find(u => u.email === "supatra4800@gmail.com");
  console.log("Found supatra4800?", found ? found.id : "Not found in auth.users");
  if (found) {
    const { error: dErr } = await client.auth.admin.deleteUser(found.id);
    if (dErr) console.error("delete error:", dErr);
    else console.log("Successfully deleted supatra4800 from auth.users!");
  }
}

findSupatra();

