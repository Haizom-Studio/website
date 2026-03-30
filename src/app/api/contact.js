export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

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
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), {
        status: 400,
      });
    }

    // 🔍 Check duplicate first
    const existing = await env.DB.prepare(
      `SELECT * FROM contacts WHERE email = ? AND date = ? AND time = ?`
    )
      .bind(email, date, time)
      .first();

    if (existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "You already booked this time slot",
        }),
        { status: 409 }
      );
    }

    // ✅ Insert if not duplicate
    await env.DB.prepare(
      `INSERT INTO contacts 
      (first_name, last_name, email, service, specialist, date, time) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(firstName, lastName, email, service, specialist, date, time)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
}