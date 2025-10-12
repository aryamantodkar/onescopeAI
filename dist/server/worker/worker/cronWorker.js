// src/server/worker/cronWorker.ts
import { pool } from "@/server/db/pg";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
// Optional Drizzle client for logging
const rawConn = postgres(env.DATABASE_URL);
const db = drizzle(rawConn);
// ----------------------------
// Atomically claim next job
// ----------------------------
async function claimNextJob() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      UPDATE cron_queue
      SET locked_at = now()
      WHERE id = (
        SELECT id FROM cron_queue
        WHERE processed = false
          AND (next_run_at IS NULL OR next_run_at <= now())
        ORDER BY created_at
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *;
    `);
        return res.rows[0];
    }
    finally {
        client.release();
    }
}
async function processJob(job) {
    if (!job)
        return;
    try {
        // Example: Internal type job
        if (job.payload?.type === "runPrompts") {
            const { workspaceId } = job;
            // Call your internal function directly
            // e.g., runPromptsForWorkspace(workspaceId)
            console.log("Running prompts for workspace:", workspaceId);
        }
        // // Example: Webhook type job
        // else if (job.payload?.type === "webhook") {
        //   const { url, method = "POST", body } = job.payload;
        //   await fetch(url, { method, body: JSON.stringify(body) });
        // }
        // Success: Insert job_run and mark processed
        await pool.query(`INSERT INTO job_runs (jobId, workspaceId, startedAt, finishedAt, status, output)
       VALUES ($1, $2, now(), now(), 'success', $3::jsonb)`, [job.jobId, job.workspaceId, JSON.stringify({ result: "ok" })]);
        await pool.query(`UPDATE cron_queue SET processed = true WHERE id = $1`, [job.id]);
    }
    catch (err) {
        const attempts = (job.attempts || 0) + 1;
        const maxAttempts = job.max_attempts || 3;
        if (attempts >= maxAttempts) {
            // Mark as permanently failed
            await pool.query(`INSERT INTO job_runs (jobId, workspaceId, startedAt, finishedAt, status, error)
         VALUES ($1, $2, now(), now(), 'failed', $3)`, [job.jobId, job.workspaceId, String(err.message || err)]);
            await pool.query(`UPDATE cron_queue SET processed = true, last_error = $2, attempts = $1 WHERE id = $3`, [attempts, String(err.message || err), job.id]);
        }
        else {
            // Retry with exponential backoff
            const backoffSeconds = Math.pow(attempts, 2) * 60; // 1min, 4min, 9min, ...
            await pool.query(`UPDATE cron_queue SET attempts = $1, next_run_at = now() + ($2 || ' seconds')::interval, last_error = $3 WHERE id = $4`, [attempts, backoffSeconds, String(err.message || err), job.id]);
        }
    }
}
async function mainLoop() {
    while (true) {
        const job = await claimNextJob();
        if (!job) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
        }
        await processJob(job);
    }
}
mainLoop().catch((err) => {
    console.error("Cron worker crashed:", err);
    process.exit(1);
});
