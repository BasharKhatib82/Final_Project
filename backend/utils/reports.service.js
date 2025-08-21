import { ENTITIES } from "./reports.schema.js";

export function buildSql(entityKey, filters) {
  const def = ENTITIES[entityKey];
  if (!def) throw new Error("Unknown entity");
  let sql = def.baseQuery;
  const args = [];

  for (const [k, conf] of Object.entries(def.filters)) {
    const val = filters?.[k];
    if (val === undefined || val === "") continue;
    const mapped = conf.map(val);
    if (Array.isArray(mapped)) {
      sql += ` ${conf.sql}`;
      args.push(...mapped);
    } else {
      sql += ` ${conf.sql}`;
      args.push(mapped);
    }
  }
  sql += ` ${def.orderBy}`;
  return { sql, args, def };
}

export function fetchRows(pool, entityKey, filters, cb) {
  const { sql, args, def } = buildSql(entityKey, filters);
  pool.query(sql, args, (err, rows) => {
    if (err) return cb(err);
    cb(null, { rows, def });
  });
}
