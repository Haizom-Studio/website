export const runtime = 'edge';

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      firstName,
      lastName,
      email,
      service,
      specialist,
      date,
      time,
    } = data;

    if (!firstName || !email || !service || !date || !time) {
      return Response.json({
        success: false,
        message: "Missing fields"
      }, { status: 400 });
    }

    // 🔥 FIX: Access Cloudflare env correctly
    const db = globalThis.DB;

    if (!db) {
      return Response.json({
        success: false,
        message: "DB not connected"
      }, { status: 500 });
    }

    // 🔍 Check duplicate
    const existing = await db.prepare(
      `SELECT * FROM contacts WHERE email = ? AND date = ? AND time = ?`
    )
      .bind(email, date, time)
      .first();

    if (existing) {
      return Response.json({
        success: false,
        message: "You already booked this slot"
      }, { status: 409 });
    }

    // ✅ Insert
    await db.prepare(
      `INSERT INTO contacts 
      (first_name, last_name, email, service, specialist, date, time) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(firstName, lastName, email, service, specialist, date, time)
      .run();

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({
      success: false,
      message: err.toString()
    }, { status: 500 });
  }
}