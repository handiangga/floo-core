const logAudit = async ({
  user_id,
  action,
  entity,
  entity_id,
  description,
}) => {
  // dummy dulu (biar gak error)
  console.log("AUDIT:", {
    user_id,
    action,
    entity,
    entity_id,
    description,
  });
};

module.exports = {
  logAudit,
};
