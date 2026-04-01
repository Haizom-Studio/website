import { getClientIp } from "@/lib/client-geo";
import { getD1Database } from "@/lib/d1";
import { resolveVisitorGeo } from "@/lib/ip-geo";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Record<string, unknown>;

    const firstName = typeof data.firstName === "string" ? data.firstName : "";
    const lastName =
      typeof data.lastName === "string" ? data.lastName : "";
    const email = typeof data.email === "string" ? data.email : "";
    const service = typeof data.service === "string" ? data.service : "";
    const specialist =
      typeof data.specialist === "string" ? data.specialist : "";
    const date = typeof data.date === "string" ? data.date : "";
    const time = typeof data.time === "string" ? data.time : "";

    if (!firstName || !email || !service || !date || !time) {
      return Response.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const db = getD1Database();
    if (!db) {
      return Response.json(
        { success: false, message: "DB not connected (binding issue)" },
        { status: 500 }
      );
    }

    const existing = await db
      .prepare(
        `SELECT rowid FROM contacts WHERE email = ? AND date = ? AND time = ?`
      )
      .bind(email, date, time)
      .first();

    if (existing) {
      return Response.json(
        { success: false, message: "You already booked this slot" },
        { status: 409 }
      );
    }

    const ip = getClientIp(req);
    const geo = await resolveVisitorGeo(req, ip);

    try {
      await db
        .prepare(
          `INSERT INTO contacts
          (first_name, last_name, email, service, specialist, date, time, ip_address, location, map_lat, map_lng, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`
        )
        .bind(
          firstName,
          lastName,
          email,
          service,
          specialist,
          date,
          time,
          ip || null,
          geo.locationLabel || null,
          geo.mapLat,
          geo.mapLng
        )
        .run();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const missingCol =
        msg.includes("no column named") || msg.includes("has no column named");
      if (!missingCol) throw e;
      try {
        await db
          .prepare(
            `INSERT INTO contacts
            (first_name, last_name, email, service, specialist, date, time, ip_address, location, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`
          )
          .bind(
            firstName,
            lastName,
            email,
            service,
            specialist,
            date,
            time,
            ip || null,
            geo.locationLabel || null
          )
          .run();
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        const missing2 =
          msg2.includes("no column named") || msg2.includes("has no column named");
        if (!missing2) throw e2;
        await db
          .prepare(
            `INSERT INTO contacts
            (first_name, last_name, email, service, specialist, date, time)
            VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            firstName,
            lastName,
            email,
            service,
            specialist,
            date,
            time
          )
          .run();
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, message }, { status: 500 });
  }
}
