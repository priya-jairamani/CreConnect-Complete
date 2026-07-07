export function accountStatus(user) {
  return String(user?.status || '').trim().toUpperCase();
}

export function isApproved(user) {
  const status = accountStatus(user);
  if (!status) return true;
  return status === 'APPROVED';
}

export function isPending(user) {
  return accountStatus(user) === 'PENDING';
}

export function isRejected(user) {
  return accountStatus(user) === 'REJECTED';
}
