// ================= TOKEN =================
export const setToken = (token) => {
  localStorage.setItem("access_token", token);
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

// ================= USER =================
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// ================= ROLE =================
export const getRole = () => {
  return getUser()?.role?.toLowerCase?.() || null;
};

// ================= CHECK =================
export const isLoggedIn = () => {
  return !!getToken();
};

// ================= LOGOUT =================
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};
