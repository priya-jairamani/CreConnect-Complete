const ok = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

const paginated = (res, data, { page, limit, total }) =>
  res.status(200).json({
    success: true,
    data,
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });

const error = (res, message = 'Internal server error', statusCode = 500, errors = []) =>
  res.status(statusCode).json({ success: false, message, ...(errors.length && { errors }) });

module.exports = { ok, created, paginated, error };
